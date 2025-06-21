// C:\Users\pedro\Desktop\project\src\pages\AlertsPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query'; 
import InventoryService from '../api/inventoryService';
import { InventoryAlert, AlertPriority } from '../types';
import { Loader2, Bell, CheckCircle, AlertTriangle, XCircle, TrendingUp, Package, RefreshCw } from 'lucide-react'; // Importa RefreshCw

const AlertsPage: React.FC = () => {
  console.log("AlertsPage: Iniciando renderizado de la página de alertas.");
  const [localAlerts, setLocalAlerts] = useState<InventoryAlert[]>([]);

  const { 
    data, 
    isLoading, 
    error, 
    refetch // Ahora 'refetch' se utilizará, por lo que no es necesario silenciar la advertencia
  }: UseQueryResult<InventoryAlert[], Error> = useQuery<InventoryAlert[], Error>({ 
    queryKey: ['inventoryAlerts'],
    queryFn: () => InventoryService.getInventoryAlerts(), 
    staleTime: 5 * 60 * 1000, 
    refetchInterval: 15 * 1000, 
    refetchIntervalInBackground: true, 
  });

  useEffect(() => {
    if (data) { 
      console.log("AlertsPage: useEffect - Datos recibidos del backend:", data);
      setLocalAlerts(data.map((alert: InventoryAlert) => ({ ...alert, isRead: false }))); 
      console.log("AlertsPage: Alertas locales inicializadas en useEffect:", data.map((alert: InventoryAlert) => ({ ...alert, isRead: false })));
    }
  }, [data]); 

  const priorityOrder: { [key in AlertPriority]: number } = useMemo(() => ({
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
  }), []);

  const unreadAlerts = useMemo(() => {
    console.log("AlertsPage: Calculando alertas no leídas. localAlerts actuales:", localAlerts);
    const filtered = localAlerts
      .filter((alert: InventoryAlert) => !alert.isRead) 
      .sort((a: InventoryAlert, b: InventoryAlert) => priorityOrder[b.priority] - priorityOrder[a.priority]); 
    console.log("AlertsPage: Alertas no leídas calculadas:", filtered);
    return filtered;
  }, [localAlerts, priorityOrder]);

  const markAsRead = (id: number) => {
    console.log("AlertsPage: Marcando alerta como leída - ID:", id);
    setLocalAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      );
      console.log("AlertsPage: Estado de localAlerts después de marcar como leída:", updatedAlerts);
      return updatedAlerts;
    });
    // Opcional: Si implementaras persistencia, aquí llamarías al backend y luego a refetch()
    // refetch(); 
  };

  const markAllAsRead = () => {
    console.log("AlertsPage: Marcando todas las alertas visibles como leídas.");
    setLocalAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.map(alert => 
        unreadAlerts.some(unread => unread.id === alert.id) ? { ...alert, isRead: true } : alert
      );
      console.log("AlertsPage: Estado de localAlerts después de marcar todas como leídas:", updatedAlerts);
      return updatedAlerts;
    });
    // refetch(); 
  };

  // Función para manejar el clic en el botón de refrescar
  const handleRefreshAlerts = () => {
    console.log("AlertsPage: Botón de refrescar clickeado. Forzando refetch.");
    refetch(); // Llama a la función refetch para recargar las alertas inmediatamente
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Medium': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: InventoryAlert['status']) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Low Stock': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Out of Stock': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Overstocked': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: InventoryAlert['status']) => {
    switch (status) {
      case 'In Stock': return <CheckCircle className="w-4 h-4" />;
      case 'Low Stock': return <AlertTriangle className="w-4 h-4" />;
      case 'Out of Stock': return <XCircle className="w-4 h-4" />;
      case 'Overstocked': return <TrendingUp className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
        <Bell size={36} /> Sistema de Alertas Inteligentes
      </h1>
      <p className="text-slate-300 mb-8">Monitorea y gestiona las notificaciones importantes de tu inventario.</p>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Alertas Activas ({unreadAlerts.length})
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />}
          </h2>
          <div className="flex gap-2"> {/* Contenedor para los botones */}
            {unreadAlerts.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Marcar todas como leídas
              </button>
            )}
            {/* NUEVO BOTÓN: Actualizar Alertas */}
            <button
              onClick={handleRefreshAlerts}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              disabled={isLoading} // Deshabilitar si ya está cargando
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
              Actualizar
            </button>
          </div>
        </div>

        {isLoading && !data ? ( // Muestra el spinner de carga si está cargando y no hay datos aún
          <div className="text-center py-8 flex justify-center items-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mr-2" /> Cargando alertas...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            <p>Error al cargar las alertas: {error.message}</p>
            <p>Por favor, revisa la consola para más detalles.</p>
          </div>
        ) : unreadAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg">¡No hay alertas activas en este momento!</p>
            <p className="text-sm mt-2">Tu inventario está en buen estado o revisa la configuración de productos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Prioridad</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producto</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Estado de Stock</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cantidad</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Mín. Stock</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Últ. Actualización</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {unreadAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority === 'Critical' && <XCircle size={12} />}
                        {alert.priority === 'High' && <AlertTriangle size={12} />}
                        {alert.priority === 'Medium' && <Bell size={12} />}
                        {alert.priority === 'Low' && <CheckCircle size={12} />} 
                        {alert.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{alert.name} <span className="text-slate-400 text-xs">({alert.sku})</span></td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(alert.status)}`}>
                        {getStatusIcon(alert.status)}
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{alert.quantity}</td>
                    <td className="py-3 px-4 text-slate-300">{alert.minStock ?? 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-300 text-sm">
                      {new Date(alert.lastUpdated).toLocaleDateString()} {new Date(alert.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors duration-200"
                      >
                        Marcar como Leída
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
