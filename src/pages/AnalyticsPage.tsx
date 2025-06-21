// C:\Users\pedro\Desktop\project\src\pages\AnalyticsPage.tsx

import React from 'react';
import { useInventoryAnalytics } from '../hooks/useInventory'; 
import { 
  Loader2, 
  AlertCircle, 
  Package, 
  TrendingUp, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  XCircle 
} from 'lucide-react'; 

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  console.log("AnalyticsPage: Iniciando renderizado."); 
  const { data: analyticsData, isLoading, error } = useInventoryAnalytics('all'); 

  console.log("AnalyticsPage: isLoading:", isLoading, "error:", error, "analyticsData:", analyticsData); 

  if (isLoading) {
    console.log("AnalyticsPage: Mostrando estado de carga..."); 
    return (
      <div className="space-y-8 p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" /> 
        <p className="text-xl mt-4">Cargando datos de análisis...</p>
      </div>
    );
  }

  if (error) {
    console.error("AnalyticsPage: Mostrando estado de error:", error); 
    return (
      <div className="space-y-8 p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Error al cargar el análisis</h2>
        <p className="text-red-400">Hubo un problema al obtener los datos de análisis: {error.message}</p>
        <p className="text-slate-400 mt-2">Asegúrate de que tu backend esté funcionando correctamente y que el endpoint de analíticas sea accesible.</p>
      </div>
    );
  }

  if (!analyticsData) {
    console.log("AnalyticsPage: No hay datos de análisis disponibles (analyticsData es null/undefined)."); 
    return (
      <div className="space-y-8 p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
        <Package className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4">No hay datos de análisis disponibles</h2>
        <p className="text-slate-400">Parece que no se pudieron cargar los datos de análisis. Intenta recargar la página o verifica tus productos.</p>
      </div>
    );
  }

  console.log("AnalyticsPage: Datos de análisis cargados exitosamente."); 

  // Mapeo de nombres de estado a colores Tailwind (usando los mismos de InventoryTable.tsx)
  const STATUS_COLOR_MAP: { [key: string]: string } = {
    'In Stock': '#34d399',     // text-emerald-400
    'Low Stock': '#fbbf24',    // text-amber-400
    'Out of Stock': '#ef4444', // text-red-400
    'Overstocked': '#22d3ee',  // text-cyan-400
    'Unknown': '#94a3b8',      // text-gray-400 (slate-400)
  };

  // Preparar datos para gráficos
  const categoryChartData = Object.entries(analyticsData.categoriesDistribution).map(([name, value]) => ({ name, value }));
  
  // Datos del gráfico de pastel de estados usando los conteos del backend
  const statusChartData = [
    { name: 'En Stock', value: analyticsData.inStockItems, color: STATUS_COLOR_MAP['In Stock'] },
    { name: 'Stock Bajo', value: analyticsData.lowStockItems, color: STATUS_COLOR_MAP['Low Stock'] },
    { name: 'Agotado', value: analyticsData.outOfStockItems, color: STATUS_COLOR_MAP['Out of Stock'] },
    { name: 'Sobrestock', value: analyticsData.overstockedItems, color: STATUS_COLOR_MAP['Overstocked'] },
    { name: 'Desconocido', value: analyticsData.unknownStatusItems, color: STATUS_COLOR_MAP['Unknown'] },
  ].filter(entry => entry.value > 0); // Filtra los estados que no tienen productos para no mostrarlos

  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold text-cyan-400 mb-6">Análisis de Inventario</h1>
      <p className="text-slate-300 mb-8">Obtén una visión profunda de tus métricas de inventario clave y tendencias.</p>

      {/* Sección de Métricas Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-700 flex items-center gap-4">
          <Package className="w-10 h-10 text-blue-400" />
          <div>
            <p className="text-slate-400 text-sm">Total de Productos (Tipos)</p>
            <p className="text-2xl font-bold text-white">{analyticsData.totalProducts}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-700 flex items-center gap-4">
          <TrendingUp className="w-10 h-10 text-emerald-400" />
          <div>
            <p className="text-slate-400 text-sm">Ítems Totales en Stock</p>
            <p className="text-2xl font-bold text-white">{analyticsData.totalItemsInStock.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-700 flex items-center gap-4">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <div>
            <p className="text-slate-400 text-sm">Productos con Stock Bajo</p>
            <p className="text-2xl font-bold text-white">{analyticsData.lowStockItems}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-700 flex items-center gap-4">
          <XCircle className="w-10 h-10 text-red-400" /> 
          <div>
            <p className="text-slate-400 text-sm">Productos Agotados</p>
            <p className="text-2xl font-bold text-white">{analyticsData.outOfStockItems}</p>
          </div>
        </div>
      </div>

      {/* Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Distribución por Categoría */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChartIcon className="w-6 h-6 text-purple-400" /> Distribución por Categoría
          </h3>
          <div className="bg-slate-700 h-64 rounded-lg flex items-center justify-center text-slate-500">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} 
                    itemStyle={{ color: '#ffffff' }} 
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No hay datos de categoría para mostrar.</p>
            )}
          </div>
        </div>

        {/* Gráfico de Distribución por Estado */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-pink-400" /> Distribución por Estado
          </h3>
          <div className="bg-slate-700 h-64 rounded-lg flex items-center justify-center text-slate-500">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name" // Usar 'name' para la leyenda y tooltip
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false} 
                  >
                    {/* ASIGNACIÓN DE COLORES DINÁMICA */}
                    {statusChartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} 
                    itemStyle={{ color: '#ffffff' }} 
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No hay datos de estado para mostrar.</p>
            )}
          </div>
        </div>
      </div>

      {/* Productos Destacados */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-green-400" /> Top 5 Productos por Valor de Inventario
        </h3>
        {analyticsData.topProductsByValue.length === 0 ? (
          <p className="text-slate-500">No hay productos disponibles para calcular el valor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producto</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Categoría</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cantidad</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Valor Unitario</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {analyticsData.topProductsByValue.map(product => (
                  <tr key={product.id} className="hover:bg-slate-700/20">
                    <td className="py-3 px-4 whitespace-nowrap text-white">{product.name} ({product.sku})</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">{product.category || 'N/A'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">{product.quantity}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">${parseFloat(product.price.toString()).toFixed(2)}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-white font-bold">${parseFloat(product.value.toString()).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Métricas de Rendimiento y Estado del Sistema (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-400" /> Métricas de Rendimiento
          </h3>
          <p className="text-slate-400 mb-2">Tasa de Cumplimiento: <span className="text-white font-semibold">{analyticsData.performanceMetrics.fulfillmentRate}</span></p>
          <p className="text-slate-400">Entrega a Tiempo: <span className="text-white font-semibold">{analyticsData.performanceMetrics.deliveryOnTime}</span></p>
          <p className="text-slate-500 text-sm mt-4"> (Estas métricas requieren datos de órdenes o envíos)</p>
        </div>
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" /> Estado del Sistema
          </h3>
          <p className="text-slate-400 mb-2">Conexión a Base de Datos: <span className={`font-semibold ${analyticsData.systemStatus.databaseConnection === 'OK' ? 'text-emerald-400' : 'text-red-400'}`}>{analyticsData.systemStatus.databaseConnection}</span></p>
          <p className="text-slate-400">Disponibilidad del Servidor: <span className={`font-semibold ${analyticsData.systemStatus.serverUptime === 'OK' ? 'text-emerald-400' : 'text-red-400'}`}>{analyticsData.systemStatus.serverUptime}</span></p>
          <p className="text-slate-500 text-sm mt-4"> (Monitoreo básico del backend)</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
