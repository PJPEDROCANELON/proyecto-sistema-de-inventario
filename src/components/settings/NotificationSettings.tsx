// C:\Users\pedro\Desktop\project\src\components\settings\NotificationSettings.tsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
// ELIMINADO: import axios from 'axios'; // Ya no es necesario aquí

interface NotificationSettingsProps {
  initialLowStockAlert: boolean;
  initialOutOfStockAlert: boolean;
  initialFrequency: 'inmediate' | 'daily' | 'weekly';
  onSaveNotificationSettings: (settings: { 
    lowStockAlert: boolean; 
    outOfStockAlert: boolean; 
    frequency: 'inmediate' | 'daily' | 'weekly'; 
  }) => Promise<void>;
  isLoading: boolean; 
  error: string | null; 
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialLowStockAlert,
  initialOutOfStockAlert,
  initialFrequency,
  onSaveNotificationSettings,
  isLoading,
  error,
}) => {
  const [lowStockAlert, setLowStockAlert] = useState(initialLowStockAlert);
  const [outOfStockAlert, setOutOfStockAlert] = useState(initialOutOfStockAlert);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincroniza los estados internos cuando las props iniciales cambian
  React.useEffect(() => {
    setLowStockAlert(initialLowStockAlert);
    setOutOfStockAlert(initialOutOfStockAlert);
    setFrequency(initialFrequency);
  }, [initialLowStockAlert, initialOutOfStockAlert, initialFrequency]);

  // Efecto para detectar si hay cambios y habilitar el botón de guardar
  React.useEffect(() => {
    if (
      lowStockAlert !== initialLowStockAlert ||
      outOfStockAlert !== initialOutOfStockAlert ||
      frequency !== initialFrequency
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [lowStockAlert, outOfStockAlert, frequency, initialLowStockAlert, initialOutOfStockAlert, initialFrequency]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.info('No hay cambios en la configuración de notificaciones para guardar.');
      return;
    }

    try {
      await onSaveNotificationSettings({ lowStockAlert, outOfStockAlert, frequency });
      setHasChanges(false); 
    } catch (err: unknown) { 
      console.error('Error al guardar notificaciones en NotificationSettings:', err);
      // El error se propaga al componente padre (SettingsPage.tsx) para que lo maneje.
      throw err; 
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Notificaciones de Inventario</h3>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Toggle para Alerta de Bajo Stock */}
        <div className="flex items-center justify-between">
          <label htmlFor="lowStockAlert" className="text-slate-300 text-base">Alertas de Bajo Stock</label>
          <input
            type="checkbox"
            id="lowStockAlert"
            checked={lowStockAlert}
            onChange={(e) => setLowStockAlert(e.target.checked)}
            className="form-checkbox h-5 w-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>

        {/* Toggle para Alerta de Fuera de Stock */}
        <div className="flex items-center justify-between">
          <label htmlFor="outOfStockAlert" className="text-slate-300 text-base">Alertas de Fuera de Stock</label>
          <input
            type="checkbox"
            id="outOfStockAlert"
            checked={outOfStockAlert}
            onChange={(e) => setOutOfStockAlert(e.target.checked)}
            className="form-checkbox h-5 w-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>

        {/* Selector de Frecuencia */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-slate-300 mb-1">Frecuencia de Alertas</label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'inmediate' | 'daily' | 'weekly')}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
            disabled={isLoading}
          >
            <option value="inmediate">Inmediato</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
          </select>
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            hasChanges && !isLoading
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Guardando...</span>
          ) : (
            'Guardar Preferencias'
          )}
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;
