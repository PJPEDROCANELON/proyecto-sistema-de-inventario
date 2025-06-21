import React from 'react';
import { 
  Home, 
  Package, 
  BarChart3, 
  Settings, 
  Bell,
  Zap
} from 'lucide-react'; // Eliminado Search ya que no se usa

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: {  // Añadida la prop user
    id: number;
    nombre: string;
    email: string;
    createdAt: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange,
  user  // Recibiendo la prop user
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-cyan-500/20 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-cyan-500/20">
        <div className="relative">
          <Zap className="w-8 h-8 text-cyan-400" />
          <div className="absolute inset-0 w-8 h-8 text-cyan-400 animate-pulse opacity-50">
            <Zap className="w-8 h-8" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">NeoStock</h1>
          <p className="text-xs text-cyan-400">Futuristic Inventory</p>
        </div>
      </div>

      {/* User Profile Section - Añadido */}
      <div className="p-4 border-b border-cyan-500/20 flex items-center gap-3">
        <div className="bg-cyan-500/10 rounded-full w-10 h-10 flex items-center justify-center">
          <span className="text-cyan-300 font-bold">
            {user.nombre.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-white font-medium">{user.nombre}</h3>
          <p className="text-xs text-cyan-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-300 group ${
                isActive
                  ? 'bg-cyan-500/10 border-r-2 border-cyan-400 text-cyan-400'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/5'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${
                isActive ? 'drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'group-hover:drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]'
              }`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Indicator */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">System Online</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">All systems operational</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;