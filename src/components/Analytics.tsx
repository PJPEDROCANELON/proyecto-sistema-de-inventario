import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

const Analytics: React.FC = () => {
  const chartData = {
    inventoryTrend: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 78 },
      { month: 'Mar', value: 92 },
      { month: 'Apr', value: 88 },
      { month: 'May', value: 95 },
      { month: 'Jun', value: 87 }
    ],
    categoryDistribution: [
      { category: 'Technology', value: 45, colorClass: 'bg-cyan-500' },
      { category: 'Components', value: 30, colorClass: 'bg-emerald-500' },
      { category: 'Materials', value: 15, colorClass: 'bg-amber-500' },
      { category: 'Supplies', value: 10, colorClass: 'bg-purple-500' }
    ]
  };

  // Mapeo de colores para evitar problemas con Tailwind
  const colorClasses = {
    cyan: {
      container: 'bg-cyan-500/20 border-cyan-500/30',
      icon: 'text-cyan-400'
    },
    emerald: {
      container: 'bg-emerald-500/20 border-emerald-500/30',
      icon: 'text-emerald-400'
    },
    amber: {
      container: 'bg-amber-500/20 border-amber-500/30',
      icon: 'text-amber-400'
    },
    purple: {
      container: 'bg-purple-500/20 border-purple-500/30',
      icon: 'text-purple-400'
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon,
    color = 'cyan'
  }: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ComponentType<any>;
    color?: keyof typeof colorClasses;
  }) => {
    const colors = colorClasses[color] || colorClasses.cyan;
    
    return (
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${colors.container}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-1">Advanced inventory analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Inventory Turnover"
          value="4.2x"
          change="+12%"
          trend="up"
          icon={Activity}
          color="cyan"
        />
        <MetricCard
          title="Stock Accuracy"
          value="97.8%"
          change="+2.1%"
          trend="up"
          icon={BarChart3}
          color="emerald"
        />
        <MetricCard
          title="Carrying Cost"
          value="$45.2K"
          change="-8%"
          trend="down"
          icon={TrendingDown}
          color="amber"
        />
        <MetricCard
          title="Order Frequency"
          value="24/month"
          change="+15%"
          trend="up"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Trend Chart */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Inventory Trend (6 Months)
            </h2>
          </div>
          <div className="p-6">
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between">
                {chartData.inventoryTrend.map((item) => (
                  <div key={item.month} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t transition-all duration-500 hover:scale-110"
                      style={{ height: `${(item.value / 100) * 200}px` }}
                    ></div>
                    <span className="text-slate-400 text-sm">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center mt-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded"></div>
                <span className="text-slate-400 text-sm">Stock Level %</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Category Distribution
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {chartData.categoryDistribution.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3">
                    <div 
                      className={`${item.colorClass} h-3 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Predictive Insights */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">Predictive Insights</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-medium">Stock Alert</span>
                </div>
                <p className="text-slate-300 text-sm">Neural Interface Cables expected to run out in 3 days</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Optimization</span>
                </div>
                <p className="text-slate-300 text-sm">Reduce Plasma Cells order by 20% to optimize storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Fulfillment Rate</span>
                <span className="text-emerald-400 font-medium">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Average Lead Time</span>
                <span className="text-cyan-400 font-medium">2.3 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Stock Accuracy</span>
                <span className="text-emerald-400 font-medium">97.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cost per Unit</span>
                <span className="text-amber-400 font-medium">$12.45</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">System Health</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">API Response</span>
                <span className="text-cyan-400 text-sm">{'< 100ms'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Uptime</span>
                <span className="text-emerald-400 text-sm">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Backup</span>
                <span className="text-slate-300 text-sm">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;