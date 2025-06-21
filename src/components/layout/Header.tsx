// C:\Users\pedro\Desktop\project\src\components/layout/Header.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../../types/index';
import { LogOut } from 'lucide-react'; 

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
      isActive
        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
    }`;

  return (
    <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4 shadow-xl z-40 relative">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-white text-xl font-bold">
          <img src="https://placehold.co/40x40/22d3ee/FFFFFF?text=NEO" alt="NeoStock Logo" className="rounded-full" />
          NeoStock
        </NavLink>

        <nav className="flex items-center gap-4">
          <NavLink to="/dashboard" className={linkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/inventory" className={linkClasses}>
            Inventario
          </NavLink>
          <NavLink to="/analytics" className={linkClasses}>
            Análisis
          </NavLink>
          {/* NUEVO: Botón de Alertas */}
          <NavLink to="/alerts" className={linkClasses}>
            Alertas
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {currentUser && (
            <span className="text-slate-300 text-sm">
              Hola, <span className="font-semibold text-white">{currentUser.nombre}</span>
            </span>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
