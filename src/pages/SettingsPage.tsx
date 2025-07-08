// C:\Users\pedro\Desktop\project\src\pages\SettingsPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types'; 
import ProfileSettings from '../components/settings/ProfileSettings'; 
import NotificationSettings from '../components/settings/NotificationSettings'; 
import InventorySettings from '../components/settings/InventorySettings'; 
import AppSettings from '../components/settings/AppSettings'; 
import DataManagementSettings from '../components/settings/DataManagementSettings'; 
import AboutSettings from '../components/settings/AboutSettings'; 
import ExchangeRateSettings from '../components/settings/ExchangeRateSettings'; // NUEVO: Importar ExchangeRateSettings

import { toast } from 'react-toastify'; 
import authService from '../api/authService'; 
import axios from 'axios'; 

interface SettingsPageProps {
  currentUser: User | null; 
  onUpdateCurrentUser: (updatedUser: User) => void; 
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateCurrentUser }) => {
  const [activeSection, setActiveSection] = useState<string>('account');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const [lowStockAlert, setLowStockAlert] = useState(currentUser?.lowStockAlertEnabled ?? true);
  const [outOfStockAlert, setOutOfStockAlert] = useState(currentUser?.outOfStockAlertEnabled ?? true);
  const [notificationFrequency, setNotificationFrequency] = useState(currentUser?.notificationFrequency ?? 'daily');

  useEffect(() => {
    if (currentUser) {
      setLowStockAlert(currentUser.lowStockAlertEnabled);
      setOutOfStockAlert(currentUser.outOfStockAlertEnabled);
      setNotificationFrequency(currentUser.notificationFrequency);
    }
  }, [currentUser]);

  const handleUpdateUser = useCallback(async (updatedUserPartial: Partial<User>) => {
    if (!currentUser) {
      setProfileError('No hay usuario autenticado para actualizar.');
      toast.error('No hay usuario autenticado para actualizar.');
      return;
    }
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      console.log('🔵 [SettingsPage] Intentando actualizar perfil de usuario con datos:', updatedUserPartial);
      const updatedFullUser = await authService.updateUserProfile({
        id: currentUser.id,
        ...updatedUserPartial
      }); 
      
      onUpdateCurrentUser(updatedFullUser); 
      toast.success('Perfil actualizado correctamente.');
    } catch (err: unknown) {
      console.error('❌ [SettingsPage] Error al actualizar perfil:', err);
      let errorMessage = 'Fallo al actualizar el perfil.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setProfileError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      throw err; 
    } finally {
      setIsSavingProfile(false);
    }
  }, [currentUser, onUpdateCurrentUser]);

  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      setProfileError('No hay usuario autenticado para cambiar la contraseña.');
      toast.error('No hay usuario autenticado para cambiar la contraseña.');
      return;
    }
    setIsSavingProfile(true); 
    setProfileError(null);
    try {
      console.log('🔵 [SettingsPage] Intentando cambiar contraseña de usuario:', currentUser.email);
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Contraseña cambiada con éxito.');
    } catch (err: unknown) {
      console.error('❌ [SettingsPage] Error al cambiar contraseña:', err);
      let errorMessage = 'Fallo al cambiar la contraseña.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setProfileError(errorMessage); 
      toast.error(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsSavingProfile(false);
    }
  }, [currentUser]);

  const handleSaveNotificationSettings = useCallback(async (settings: { 
    lowStockAlert: boolean; 
    outOfStockAlert: boolean; 
    frequency: 'inmediate' | 'daily' | 'weekly'; 
  }) => {
    if (!currentUser) {
      setNotificationError('No hay usuario autenticado para guardar las preferencias.');
      toast.error('No hay usuario autenticado para guardar las preferencias.');
      return;
    }
    setIsSavingNotifications(true);
    setNotificationError(null);
    try {
      console.log('🔵 [SettingsPage] Intentando guardar configuración de notificaciones:', settings);
      const updatedUserWithNotifications = await authService.updateUserProfile({
        id: currentUser.id,
        lowStockAlertEnabled: settings.lowStockAlert,
        outOfStockAlertEnabled: settings.outOfStockAlert,
        notificationFrequency: settings.frequency,
      });

      onUpdateCurrentUser(updatedUserWithNotifications); 
      toast.success('Preferencias de notificación guardadas correctamente.');

      setLowStockAlert(settings.lowStockAlert);
      setOutOfStockAlert(settings.outOfStockAlert);
      setNotificationFrequency(settings.frequency);

    } catch (err: unknown) {
      console.error('❌ [SettingsPage] Error al guardar configuración de notificaciones:', err);
      let errorMessage = 'Fallo al guardar la configuración de notificaciones.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setNotificationError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsSavingNotifications(false);
    }
  }, [currentUser, onUpdateCurrentUser]);

  const handleSaveInventorySettings = useCallback(async (settings: Partial<User>) => {
    if (!currentUser) {
      setInventoryError('No hay usuario autenticado para guardar las preferencias de inventario.');
      toast.error('No hay usuario autenticado para guardar las preferencias de inventario.');
      return;
    }
    setIsSavingInventory(true);
    setInventoryError(null);
    try {
      console.log('🔵 [SettingsPage] Intentando guardar configuración de inventario:', settings);
      const updatedFullUser = await authService.updateUserProfile({
        id: currentUser.id,
        ...settings, 
      });

      onUpdateCurrentUser(updatedFullUser); 
      toast.success('Configuración de inventario guardada correctamente.');
    } catch (err: unknown) {
      console.error('❌ [SettingsPage] Error al guardar configuración de inventario:', err);
      let errorMessage = 'Fallo al guardar la configuración de inventario.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setInventoryError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsSavingInventory(false);
    }
  }, [currentUser, onUpdateCurrentUser]);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-6"> 
            <h2 className="text-2xl font-semibold text-white mb-4">Configuración de la Cuenta</h2> 
            <p className="text-gray-300">Aquí podrás gestionar la información de tu perfil, contraseñas y notificaciones.</p> 
            
            <ProfileSettings 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateUser} 
              onChangePassword={handleChangePassword} 
              isLoading={isSavingProfile} 
              error={profileError} 
            />

            <NotificationSettings 
              initialLowStockAlert={lowStockAlert} 
              initialOutOfStockAlert={outOfStockAlert} 
              initialFrequency={notificationFrequency} 
              onSaveNotificationSettings={handleSaveNotificationSettings}
              isLoading={isSavingNotifications}
              error={notificationError}
            />
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-6"> {/* Añadido space-y-6 para separación entre secciones */}
            <h2 className="text-2xl font-semibold text-white mb-4">Configuración de Inventario</h2> 
            <p className="text-gray-300">Ajusta los umbrales de stock, unidades de medida y formatos de fecha y hora.</p> 
            <InventorySettings 
              currentUser={currentUser}
              onSaveInventorySettings={handleSaveInventorySettings} 
              isLoading={isSavingInventory}
              error={inventoryError}
            />
            {/* NUEVO: Componente de Gestión de Tasas de Cambio */}
            <ExchangeRateSettings /> 
          </div>
        );
      case 'app':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Preferencias de la Aplicación</h2> 
            <p className="text-gray-300">Personaliza el tema visual y otras opciones de la interfaz.</p> 
            <AppSettings /> 
          </div>
        );
      case 'data':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Gestión de Datos</h2> 
            <p className="text-gray-300">Exporta tus datos de inventario.</p> 
            <DataManagementSettings />
          </div>
        );
      case 'about':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Acerca de la Aplicación</h2> 
            <p className="text-gray-300">Información sobre NeoStock.</p> 
            <AboutSettings />
          </div>
        );
      default:
        return null;
    }
  };

  const navButtonClass = (section: string) => 
    `px-4 py-3 text-left rounded-lg transition-all duration-200 ${
      activeSection === section 
        ? 'bg-purple-600 text-white shadow-lg' 
        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white' 
    }`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg"> 
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Ajustes</h1> 

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar de Navegación de Ajustes */}
        <div className="md:w-1/4 bg-gray-800 rounded-lg shadow p-4 flex flex-col space-y-2"> 
          <button onClick={() => setActiveSection('account')} className={navButtonClass('account')}>
            Configuración de la Cuenta
          </button>
          <button onClick={() => setActiveSection('inventory')} className={navButtonClass('inventory')}>
            Configuración de Inventario
          </button>
          <button 
            onClick={() => setActiveSection('app')} 
            className={navButtonClass('app')}
          >
            Preferencias de la Aplicación
          </button>
          <button onClick={() => setActiveSection('data')} className={navButtonClass('data')}>
            Gestión de Datos
          </button>
          <button onClick={() => setActiveSection('about')} className={navButtonClass('about')}>
            Acerca de la Aplicación
          </button>
        </div>

        {/* Contenido de la Sección Activa */}
        <div className="md:w-3/4 bg-gray-800 rounded-lg shadow p-6"> 
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;