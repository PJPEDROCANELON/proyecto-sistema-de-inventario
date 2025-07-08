// C:\Users\pedro\Desktop\project\src\pages\Dashboard.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { useQuery } from '@tanstack/react-query';
import inventoryService from '../api/inventoryService';
import exchangeRateService from '../api/exchangeRateService'; 
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign, 
  TrendingUp,
  Layers,
  BarChart2,
  List,
  Loader2, 
  Database,
  Server,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { User, InventoryStats, InventoryAlert, TopProductValue, ExchangeRate } from '../types'; 
import DoughnutChart from '../components/charts/DoughnutChart';
import BarChart from '../components/charts/BarChart';
import AlertCard from '../components/AlertCard';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const userCurrencySymbol = user?.defaultCurrencySymbol || '$';

  // CAMBIO CLAVE EN useQuery: Asegurar que queryFn devuelva el tipo correcto
  const {
    data: latestExchangeRate,
    isLoading: isLoadingExchangeRate,
    error: exchangeRateError,
  } = useQuery<ExchangeRate | null, Error>({
    queryKey: ['latestExchangeRate', 'USD', 'Bs'],
    queryFn: async (): Promise<ExchangeRate | null> => { // Tipado explícito del retorno de la función
      const res = await exchangeRateService.getLatestExchangeRate('USD', 'Bs');
      // Aseguramos que res.data sea ExchangeRate o null
      return res.success && res.data ? res.data : null; 
    },
    staleTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery<InventoryStats, Error>({
    queryKey: ['inventoryAnalytics'],
    queryFn: inventoryService.getInventoryAnalytics,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });

  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    error: alertsError,
  } = useQuery<InventoryAlert[], Error>({
    queryKey: ['inventoryAlerts'],
    queryFn: inventoryService.getInventoryAlerts,
    staleTime: 60 * 1000, 
    refetchOnWindowFocus: true, 
  });

  useEffect(() => {
    if (stats) {
      setLastUpdate(format(new Date(), 'dd MMM, HH:mm'));
    }
  }, [stats]);

  useEffect(() => {
    if (statsError) {
      console.error('Error al cargar datos del dashboard:', statsError);
      toast.error(`Error al cargar los datos del dashboard. Detalle: ${statsError.message}`, { theme: "dark" });
    }
    if (alertsError) {
      console.error('Error al cargar alertas:', alertsError);
      toast.error(`Error al cargar las alertas. Detalle: ${alertsError.message}`, { theme: "dark" });
    }
    if (exchangeRateError) {
      console.error('Error al cargar tasa de cambio:', exchangeRateError);
      toast.error(`Error al cargar la tasa de cambio. Los valores se mostrarán en USD. Detalle: ${exchangeRateError.message}`, { theme: "dark" });
    }
  }, [statsError, alertsError, exchangeRateError]);

  // Función para formatear valores monetarios
  const formatCurrency = useCallback((value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    
    let displayValue = value;
    let symbol = '$'; // Símbolo por defecto para USD

    // CAMBIO: Verificación más robusta para latestExchangeRate
    if (userCurrencySymbol === 'Bs' && latestExchangeRate?.rate && latestExchangeRate.rate > 0) {
      displayValue = value * latestExchangeRate.rate;
      symbol = 'Bs '; 
    }

    return `${symbol}${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [userCurrencySymbol, latestExchangeRate]); 


  const inventoryStatusData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };
    const data = [
      stats.inStockItems,
      stats.lowStockItems,
      stats.outOfStockItems,
      stats.overstockedItems,
      stats.unknownStatusItems,
    ];
    const labels = ['En Stock', 'Bajo Stock', 'Fuera de Stock', 'Sobre Stock', 'Desconocido'];
    const colors = ['#22C55E', '#FBBF24', '#EF4444', '#0EA5E9', '#6B7280'];
    
    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: colors,
          hoverOffset: 4,
        },
      ],
    };
  }, [stats]);

  const categoriesDistributionData = useMemo(() => {
    if (!stats || !stats.categoriesDistribution) return { labels: [], datasets: [] };
    const labels = Object.keys(stats.categoriesDistribution);
    const data = Object.values(stats.categoriesDistribution);
    const backgroundColors = labels.map((_, index) => {
        const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#EF4444'];
        return colors[index % colors.length];
    });

    return {
      labels: labels,
      datasets: [
        {
          label: 'Número de Productos por Categoría',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.2', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, [stats]);

  if (isLoadingStats || isLoadingExchangeRate) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin mr-3" />
        Cargando datos del dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 min-h-screen text-slate-200">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            ¡Hola, {user ? user.username : 'Usuario'}!
          </h1>
          <p className="text-slate-400 text-lg">Bienvenido de nuevo a tu panel de control de inventario.</p>
        </div>
        <div className="mt-4 sm:mt-0 text-right text-slate-500">
          Última actualización: {lastUpdate || 'Cargando...'}
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          icon={<Package className="w-6 h-6 text-cyan-400" />}
          title="Total Productos"
          value={stats?.totalProducts?.toLocaleString() || 'N/A'}
          description="Número total de productos únicos en inventario."
          bgColor="bg-cyan-900/30"
          borderColor="border-cyan-700/50"
        />
        <MetricCard 
          icon={<ShoppingCart className="w-6 h-6 text-green-400" />}
          title="Items en Stock"
          value={stats?.totalItemsInStock?.toLocaleString() || 'N/A'}
          description="Cantidad total de artículos disponibles."
          bgColor="bg-green-900/30"
          borderColor="border-green-700/50"
        />
        <MetricCard 
          icon={<DollarSign className="w-6 h-6 text-fuchsia-400" />}
          title="Valor Total Inventario"
          value={formatCurrency(stats?.totalValue)} 
          description="Valor monetario estimado de todo el inventario."
          bgColor="bg-fuchsia-900/30"
          borderColor="border-fuchsia-700/50"
        />
        <MetricCard 
          icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
          title="Productos Bajo Stock"
          value={stats?.lowStockItems?.toLocaleString() || 'N/A'}
          description="Artículos que necesitan ser reabastecidos pronto."
          bgColor="bg-amber-900/30"
          borderColor="border-amber-700/50"
        />
      </div>

      {/* Sección de Alertas y Métricas de Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" /> Alertas de Inventario ({alerts?.length || 0})
          </h2>
          {isLoadingAlerts ? (
            <div className="text-center text-slate-400 py-8 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando alertas...
            </div>
          ) : alertsError ? (
            <div className="text-center text-red-400 py-8">
              Error al cargar alertas: {alertsError.message}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
              <p>¡Todo en orden! No hay alertas de inventario.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-400" /> Métricas de Rendimiento
          </h2>
          <div className="space-y-4">
            <MetricLine 
              label="Tasa de Cumplimiento" 
              value={stats?.performanceMetrics?.fulfillmentRate || 'N/A'} 
              icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            />
            <MetricLine 
              label="Entrega a Tiempo" 
              value={stats?.performanceMetrics?.deliveryOnTime || 'N/A'} 
              icon={<CheckCircle className="w-5 h-5 text-blue-400" />}
            />
              <MetricLine 
              label="Estado de la Base de Datos" 
              value={stats?.systemStatus?.databaseConnection || 'N/A'} 
              icon={stats?.systemStatus?.databaseConnection === 'OK' ? <Database className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            />
              <MetricLine 
              label="Tiempo Activo del Servidor" 
              value={stats?.systemStatus?.serverUptime || 'N/A'} 
              icon={<Server className="w-5 h-5 text-orange-400" />}
            />
          </div>
        </div>
      </div>

      {/* Gráficos de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" /> Estado del Inventario por Tipo
          </h2>
          {inventoryStatusData.labels.length > 0 ? (
            <div className="h-64 flex justify-center items-center">
              <DoughnutChart data={inventoryStatusData} />
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">No hay datos de estado de inventario para mostrar.</div>
          )}
        </div>

        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <List className="w-6 h-6 text-green-400" /> Distribución por Categorías
          </h2>
          {categoriesDistributionData.labels.length > 0 ? (
            <div className="h-64">
              <BarChart data={categoriesDistributionData} />
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">No hay datos de categorías para mostrar.</div>
          )}
        </div>
      </div>

      {/* Top Productos por Valor */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 shadow-xl mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-400" /> Top 5 Productos por Valor
        </h2>
        {stats?.topProductsByValue && stats.topProductsByValue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Precio Unitario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stats.topProductsByValue.map((product: TopProductValue) => (
                  <tr key={product.id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{product.category || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{product.quantity}</td>
                    {/* CAMBIO CLAVE: Usar formatCurrency para Precio Unitario */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatCurrency(product.price)}</td>
                    {/* CAMBIO CLAVE: Usar formatCurrency para Valor Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{formatCurrency(product.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-8">No hay datos de productos para el top por valor.</div>
        )}
      </div>

      {/* Pie de página (opcional, si lo tienes en tu Dashboard) */}
      <footer className="text-center text-slate-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} NeoStock. All rights reserved.
      </footer>
    </div>
  );
};

// Componente auxiliar para las tarjetas de métricas
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, description, bgColor, borderColor }) => (
  <div className={`p-6 rounded-xl border ${bgColor} ${borderColor} shadow-lg flex flex-col justify-between`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className={`p-2 rounded-full ${bgColor} border ${borderColor}`}>
        {icon}
      </div>
    </div>
    <p className="text-4xl font-extrabold text-white mb-2">{value}</p>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

// Componente auxiliar para las líneas de métricas de rendimiento
interface MetricLineProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const MetricLine: React.FC<MetricLineProps> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-600/50 rounded-full">{icon}</div>
      <span className="text-slate-300 font-medium">{label}:</span>
    </div>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

export default Dashboard;