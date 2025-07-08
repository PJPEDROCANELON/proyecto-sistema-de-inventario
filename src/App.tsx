// C:\Users\pedro\Desktop\project\src\App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import ProductDetails from './pages/ProductDetails';
import AnalyticsPage from './pages/AnalyticsPage'; 
import AlertsPage_Component from './pages/AlertsPage'; 
import OrdersPage from './pages/OrdersPage'; 
import SettingsPage from './pages/SettingsPage'; 
import Header from './components/layout/Header'; 
import Footer from './components/layout/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import { User, AuthResponse } from './types/index'; 
import authService from './api/authService'; 

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MerchandiseInflowPage from './pages/merchandiseInflow/MerchandiseInflowPage'; 
import { useQueryClient } from '@tanstack/react-query'; 

interface PrivateRouteProps {
  isAuthenticated: boolean;
  children: React.ReactElement; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("PrivateRoute: Usuario NO autenticado, redirigiendo a /login");
      navigate('/login', { replace: true }); 
    }
  }, [isAuthenticated, navigate, location.pathname]); 

  if (!isAuthenticated) {
    return null; 
  }

  console.log("PrivateRoute: Usuario autenticado, mostrando contenido protegido");
  return React.cloneElement(children, { isAuthenticated }); 
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0); 

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient(); 

  const handleUpdateCurrentUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser)); 
    console.log("App.tsx: currentUser actualizado globalmente y en localStorage.");
  }, []);

  const handleLogout = useCallback(() => {
    console.log("handleLogout: Cerrando sesión...");
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    console.log("   Redirigiendo a /login desde handleLogout...");
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleMerchandiseInflowSaved = useCallback(() => {
    console.log("App.tsx: Entrada de mercadería guardada, refrescando inventario...");
    setInventoryRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['products'] }); 
    console.log("App.tsx: Caché de 'products' invalidada.");
  }, [queryClient]); 

  useEffect(() => {
    console.log("App.tsx useEffect: Verificando estado de autenticación...");
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('user');

    console.log("   authToken desde localStorage:", token ? "EXISTE" : "NO EXISTE");
    console.log("   userJson desde localStorage:", userJson ? "EXISTE" : "NO EXISTE");

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        setIsAuthenticated(true);
        setCurrentUser(user); 
        console.log("   Usuario autenticado en useEffect:", user.email, ". Redirigiendo si es necesario.");

        authService.getMe()
          .then(latestUser => {
            handleUpdateCurrentUser(latestUser); 
            console.log("   Datos de usuario actualizados desde el backend.");
          })
          .catch(error => {
            console.error("Error al obtener datos de usuario desde el backend al iniciar:", error);
            handleLogout(); 
          });

        if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
          console.log("   Redirigiendo a /dashboard desde useEffect...");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("   Ya en una ruta protegida o no es necesario redirigir desde useEffect.");
        }
      } catch (e) {
        console.error("Error App.tsx: Error al parsear el usuario de localStorage", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setCurrentUser(null);
        console.log("   Local Storage limpiado. Usuario NO autenticado.");
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      console.log("   Usuario NO autenticado. Redirigiendo a /login si es necesario.");
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        console.log("   Redirigiendo a /login desde useEffect...");
        navigate('/login', { replace: true });
      } else {
        console.log("   Ya en /login o /register, no es necesario redirigir desde useEffect.");
      }
    }
  }, [navigate, location.pathname, handleUpdateCurrentUser, handleLogout]); 


  const handleLoginSuccess = (authResponse: AuthResponse) => { 
    console.log("App.tsx handleLoginSuccess: Recibido AuthResponse:", authResponse);
    if (authResponse && authResponse.user && authResponse.user.email) {
      console.log("handleLoginSuccess: Login exitoso para", authResponse.user.email);
      setIsAuthenticated(true);
      setCurrentUser(authResponse.user); 
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user)); 
      console.log("   Redirigiendo a /dashboard desde handleLoginSuccess...");
      navigate('/dashboard', { replace: true });
    } else {
      console.error("handleLoginSuccess: El AuthResponse recibido es inválido:", authResponse);
    }
  };

  const handleRegisterSuccess = (authResponse: AuthResponse) => { 
    console.log("App.tsx handleRegisterSuccess: Recibido AuthResponse:", authResponse);
    if (authResponse && authResponse.user && authResponse.user.email) {
      console.log("handleRegisterSuccess: Registro exitoso para", authResponse.user.email);
      setIsAuthenticated(true);
      setCurrentUser(authResponse.user); 
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user)); 
      console.log("   Redirigiendo a /dashboard desde handleRegisterSuccess...");
      navigate('/dashboard', { replace: true });
    } else {
      console.error("handleRegisterSuccess: El AuthResponse recibido es inválido:", authResponse);
    }
  };

  console.log("App render: isAuthenticated =", isAuthenticated, ", currentUser =", currentUser?.email);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" 
      />

      {isAuthenticated && <Header user={currentUser} onLogout={handleLogout} />} 
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <ConnectionStatus />
        </div>
        <Routes>
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterForm onRegisterSuccess={handleRegisterSuccess} />} />
          
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard user={currentUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <InventoryPage currentUser={currentUser} inventoryRefreshKey={inventoryRefreshKey} />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <ProductDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AnalyticsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AlertsPage_Component /> 
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                {/* CAMBIO CLAVE: Pasar currentUser a OrdersPage */}
                <OrdersPage currentUser={currentUser} /> 
              </PrivateRoute>
            }
          />
          <Route
            path="/merchandise-inflow"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                {/* CAMBIO CLAVE: Pasar currentUser a MerchandiseInflowPage */}
                <MerchandiseInflowPage onMerchandiseInflowSave={handleMerchandiseInflowSaved} currentUser={currentUser} /> 
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SettingsPage currentUser={currentUser} onUpdateCurrentUser={handleUpdateCurrentUser} /> 
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={
            <div className="text-center py-10">
              <h1 className="text-3xl font-bold text-white">404 - Página no encontrada</h1>
              <p className="text-slate-400 mt-2">La ruta que buscas no existe.</p>
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              >
                Volver al {isAuthenticated ? 'Tablero' : 'Inicio de Sesión'} 
              </button>
            </div>
          } /> 
        </Routes>
      </main>

      {isAuthenticated && <Footer />}
    </div>
  );
};

export default App;
