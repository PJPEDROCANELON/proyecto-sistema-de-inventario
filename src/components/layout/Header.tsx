// C:\Users\pedro\Desktop\project\src\components\layout\Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Añadido Truck para Entrada de Mercadería
import { Home, Package, ShoppingCart, BarChart, Settings, LogOut, Menu, UserCircle2, Truck } from 'lucide-react'; 
import { User } from '../../types'; 
import authService from '../../api/authService';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center relative z-40 shadow-lg">
      <div className="flex items-center">
        <Link to="/" className="text-white text-2xl font-bold mr-6 tracking-wide">
          NeoStock
        </Link>
        <nav className="hidden md:flex space-x-6">
          <NavLink to="/dashboard" icon={<Home className="w-5 h-5" />} text="Tablero" /> {/* Traducido */}
          <NavLink to="/inventory" icon={<Package className="w-5 h-5" />} text="Inventario" /> {/* Traducido */}
          <NavLink to="/orders" icon={<ShoppingCart className="w-5 h-5" />} text="Órdenes" /> {/* Traducido */}
          {/* NUEVO NavLink para Entrada de Mercadería en escritorio */}
          <NavLink to="/merchandise-inflow" icon={<Truck className="w-5 h-5" />} text="Entrada de Mercadería" /> {/* NUEVO */}
          <NavLink to="/analytics" icon={<BarChart className="w-5 h-5" />} text="Análisis" /> {/* Traducido */}
          <NavLink to="/settings" icon={<Settings className="w-5 h-5" />} text="Configuración" /> {/* Traducido */}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={toggleDropdown}
              className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors duration-200 bg-slate-800/50 hover:bg-slate-700/50"
            >
              <UserCircle2 className="w-6 h-6" />
              <span className="font-medium hidden sm:inline">{user.username}</span>
            </button>
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión {/* Traducido */}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Iniciar Sesión {/* Traducido */}
          </Link>
        )}

        {/* Mobile menu button */}
        <button className="md:hidden text-slate-300 hover:text-white" onClick={toggleMobileMenu}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-lg py-4 z-30">
          <nav className="flex flex-col space-y-2 px-4">
            <NavLink to="/dashboard" icon={<Home className="w-5 h-5" />} text="Tablero" isMobile onClick={toggleMobileMenu} /> {/* Traducido */}
            <NavLink to="/inventory" icon={<Package className="w-5 h-5" />} text="Inventario" isMobile onClick={toggleMobileMenu} /> {/* Traducido */}
            <NavLink to="/orders" icon={<ShoppingCart className="w-5 h-5" />} text="Órdenes" isMobile onClick={toggleMobileMenu} /> {/* Traducido */}
            {/* NUEVO NavLink para Entrada de Mercadería en menú móvil */}
            <NavLink to="/merchandise-inflow" icon={<Truck className="w-5 h-5" />} text="Entrada de Mercadería" isMobile onClick={toggleMobileMenu} /> {/* NUEVO */}
            <NavLink to="/analytics" icon={<BarChart className="w-5 h-5" />} text="Análisis" isMobile onClick={toggleMobileMenu} /> {/* Traducido */}
            <NavLink to="/settings" icon={<Settings className="w-5 h-5" />} text="Configuración" isMobile onClick={toggleMobileMenu} /> {/* Traducido */}
            {user && (
              <>
                <button
                  onClick={() => { handleLogout(); toggleMobileMenu(); }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" /> Cerrar Sesión {/* Traducido */}
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text, isMobile = false, onClick }) => {
  const baseClasses = "flex items-center gap-2 rounded-lg transition-colors duration-200";
  const desktopClasses = "text-slate-300 hover:text-white px-3 py-2";
  const mobileClasses = "text-slate-300 hover:bg-slate-700 px-3 py-2";

  return (
    <Link to={to} className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`} onClick={onClick}>
      {icon}
      <span className="font-medium">{text}</span>
    </Link>
  );
};

export default Header;
