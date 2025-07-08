// C:\Users\pedro\Desktop\project\src\components\settings\ProfileSettings.tsx

import React, { useState } from 'react';
import { User } from '../../types'; 
import { toast } from 'react-toastify'; 
import axios from 'axios'; 

interface ProfileSettingsProps {
  currentUser: User | null; 
  onUpdateUser: (updatedUser: Partial<User>) => Promise<void>; 
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>; 
  isLoading: boolean; 
  error: string | null; 
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, onUpdateUser, onChangePassword, isLoading, error }) => {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isEditing, setIsEditing] = useState(false); 

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false); 

  React.useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    if (!username.trim() || !email.trim()) {
      toast.error('El nombre de usuario y el correo electrónico no pueden estar vacíos.');
      return;
    }
    if (username === currentUser?.username && email === currentUser?.email) {
      toast.info('No hay cambios para guardar en el perfil.');
      setIsEditing(false);
      return;
    }

    try {
      await onUpdateUser({ username, email });
      setIsEditing(false); 
    } catch (err: unknown) { 
      console.error('Error al actualizar perfil en ProfileSettings (propagado):', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); 
    console.count('Function handleChangePassword invoked'); 

    if (isChangingPassword) {
      console.log('🔵 [ProfileSettings] Ya se está cambiando la contraseña, ignorando envío duplicado.');
      return;
    }

    setPasswordError(null); 

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Todos los campos de contraseña son obligatorios.');
      toast.error('Todos los campos de contraseña son obligatorios.'); 
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('La nueva contraseña y su confirmación no coinciden.');
      toast.error('La nueva contraseña y su confirmación no coinciden.'); 
      return;
    }
    if (newPassword.length < 6) { 
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.'); 
      return;
    }

    setIsChangingPassword(true); 
    try {
      console.log('🔵 [ProfileSettings] Calling onChangePassword prop...'); 
      await onChangePassword(currentPassword, newPassword); 
      
      // ELIMINADAS LAS LLAMADAS A TOAST AQUÍ, AHORA SOLO LAS MANEJA SettingsPage.tsx
      // console.log('✅ [ProfileSettings] Contraseña actualizada exitosamente, mostrando toast...');
      // toast.success('Contraseña cambiada con éxito.'); 
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) { 
      console.error('❌ Error al cambiar la contraseña en ProfileSettings:', err);
      let errorMessage = 'Error al cambiar la contraseña.';
      if (axios.isAxiosError(err)) { 
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) { 
        errorMessage = err.message;
      }
      setPasswordError(errorMessage); 
      // ELIMINADA LA LLAMADA A TOAST AQUÍ TAMBIÉN
      // toast.error(errorMessage); 
    } finally {
      setIsChangingPassword(false); 
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección de Información del Perfil */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Información del Perfil</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setIsEditing(true); }}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              placeholder="Tu nombre de usuario"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsEditing(true); }}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              placeholder="tu.correo@ejemplo.com"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isEditing && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isEditing || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Guardando...</span>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </form>
      </div>

      {/* Sección de Cambio de Contraseña */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Cambiar Contraseña</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-1">Contraseña Actual</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isChangingPassword}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-1">Nueva Contraseña</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isChangingPassword}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              id="confirm-new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isChangingPassword}
            />
          </div>
          {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              !isChangingPassword
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Cambiando...</span>
            ) : (
              'Cambiar Contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
