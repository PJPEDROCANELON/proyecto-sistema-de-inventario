// C:\Users\pedro\Desktop\project\src\App.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import ProductDetails from './pages/ProductDetails';
import AnalyticsPage from './pages/AnalyticsPage'; 
// CAMBIO CRÍTICO AQUÍ: Usamos un alias para forzar la re-evaluación del módulo
import AlertsPage_Component from './pages/AlertsPage'; // <-- Importa la nueva página de alertas con alias
import Header from './components/layout/Header'; 
import Footer from './components/layout/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import { User } from './types/index'; 

interface PrivateRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    console.log("PrivateRoute: Usuario NO autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }
  console.log("PrivateRoute: Usuario autenticado, mostrando contenido protegido");
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("App.tsx useEffect: Verificando estado de autenticación...");
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('user');

    console.log("   authToken desde localStorage:", token ? "EXISTE" : "NO EXISTE");
    console.log("   userJson desde localStorage:", userJson ? "EXISTE" : "NO EXISTE");

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        setIsAuthenticated(true);
        setCurrentUser(user);
        console.log("   Usuario autenticado en useEffect:", user.email, ". Redirigiendo si es necesario.");

        if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
          console.log("   Redirigiendo a /dashboard desde useEffect...");
          navigate('/dashboard');
        } else {
          console.log("   Ya en una ruta protegida o no es necesario redirigir desde useEffect.");
        }
      } catch (e) {
        console.error("Error App.tsx: Error al parsear el usuario de localStorage", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setCurrentUser(null);
        console.log("   Local Storage limpiado. Usuario NO autenticado.");
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      console.log("   Usuario NO autenticado. Redirigiendo a /login si es necesario.");
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        console.log("   Redirigiendo a /login desde useEffect...");
        navigate('/login');
      } else {
        console.log("   Ya en /login o /register, no es necesario redirigir desde useEffect.");
      }
    }
  }, [navigate, location.pathname]);

  const handleLoginSuccess = (user: User) => {
    console.log("App.tsx handleLoginSuccess: Recibido el objeto user:", user);
    if (user && user.email) {
      console.log("handleLoginSuccess: Login exitoso para", user.email);
      setIsAuthenticated(true);
      setCurrentUser(user);
      console.log("   Redirigiendo a /dashboard desde handleLoginSuccess...");
      navigate('/dashboard');
    } else {
      console.error("handleLoginSuccess: El objeto user recibido es inválido o no tiene email:", user);
    }
  };

  const handleRegisterSuccess = (user: User) => {
    console.log("App.tsx handleRegisterSuccess: Recibido el objeto user:", user);
    if (user && user.email) {
      console.log("handleRegisterSuccess: Registro exitoso para", user.email);
      setIsAuthenticated(true);
      setCurrentUser(user);
      console.log("   Redirigiendo a /dashboard desde handleRegisterSuccess...");
      navigate('/dashboard');
    } else {
      console.error("handleRegisterSuccess: El objeto user recibido es inválido o no tiene email:", user);
    }
  };

  const handleLogout = () => {
    console.log("handleLogout: Cerrando sesión...");
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    console.log("   Redirigiendo a /login desde handleLogout...");
    navigate('/login');
  };

  console.log("App render: isAuthenticated =", isAuthenticated, ", currentUser =", currentUser?.email);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {isAuthenticated && <Header currentUser={currentUser} onLogout={handleLogout} />}
      
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
                <InventoryPage currentUser={currentUser} />
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
          {/* CAMBIO CRÍTICO AQUÍ: Usamos el alias para el componente */}
          <Route
            path="/alerts"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AlertsPage_Component /> {/* Usamos el componente importado con alias */}
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
                Volver al {isAuthenticated ? 'Dashboard' : 'Inicio de Sesión'}
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
