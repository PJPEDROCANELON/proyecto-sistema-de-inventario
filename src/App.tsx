import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import ConnectionStatus from './components/ConnectionStatus';

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryTable />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
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
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          
          <main className="flex-1 ml-64 p-8">
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