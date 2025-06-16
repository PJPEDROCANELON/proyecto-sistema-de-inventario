import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import ConnectionStatus from './components/ConnectionStatus';
import RegisterForm from './components/auth/RegisterForm'; 
import LoginForm from './components/auth/LoginForm';

// Definir la interfaz para el objeto User
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Definir las props para los componentes
interface AppProps {}
interface SectionComponentsProps {
  user: User | null;
  onLogout?: () => void;
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30000,
      cacheTime: 300000,
    },
  },
});

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const renderActiveSection = () => {
    // Props para los componentes de sección
    const sectionProps: SectionComponentsProps = {
      user: user
    };

    // Si no hay usuario autenticado, mostrar formularios de autenticación
    if (!user && showAuth) {
      return (
        <div className="max-w-md mx-auto py-8">
          <div className="flex mb-6 border-b border-slate-700">
            <button
              className={`px-4 py-2 font-medium ${authMode === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
              onClick={() => setAuthMode('login')}
            >
              Iniciar Sesión
            </button>
            <button
              className={`px-4 py-2 font-medium ${authMode === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
              onClick={() => setAuthMode('register')}
            >
              Registrarse
            </button>
          </div>
          
          {authMode === 'login' ? 
            <LoginForm onSuccess={handleAuthSuccess} /> : 
            <RegisterForm onSuccess={handleAuthSuccess} />
          }
        </div>
      );
    }

    // Si hay usuario autenticado, mostrar la sección correspondiente
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...sectionProps} />;
      case 'inventory':
        return <InventoryTable {...sectionProps} />;
      case 'analytics':
        return <Analytics {...sectionProps} />;
      case 'alerts':
        return <Alerts {...sectionProps} />;
      case 'settings':
        return <Settings {...sectionProps} onLogout={handleLogout} />;
      default:
        return <Dashboard {...sectionProps} />;
    }
  };

  // Manejar autenticación exitosa
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveSection('dashboard');
  };

  // Mostrar formularios de autenticación
  const handleShowAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Connection Status Indicator */}
        <ConnectionStatus />

        <div className="relative z-10 flex">
          {/* Sidebar - Solo mostrar si el usuario está autenticado */}
          {user && (
            <Sidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              user={user}
            />
          )}
          
          <main className={`${user ? 'ml-64' : ''} flex-1 p-8 transition-all duration-300`}>
            {/* Barra superior con estado de autenticación */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-cyan-400">
                Sistema de Inventario
              </h1>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">Hola, {user.name}</span>
                  <button 
                    onClick={() => setActiveSection('settings')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Configuración
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleShowAuth('login')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    onClick={() => handleShowAuth('register')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
            
            <div className="max-w-7xl mx-auto">
              {renderActiveSection()}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;