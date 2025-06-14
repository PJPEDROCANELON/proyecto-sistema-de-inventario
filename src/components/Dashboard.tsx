import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Activity,
  Eye
} from 'lucide-react';
import { getMockDashboardData } from '../data/mockData';

const Dashboard: React.FC = () => {
  const data = getMockDashboardData();

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'up',
    color = 'cyan'
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: 'up' | 'down';
    color?: 'cyan' | 'emerald' | 'amber' | 'red';
  }) => {
    const colorClasses = {
      cyan: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400',
      emerald: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-400',
      amber: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400',
      red: 'from-red-500/20 to-rose-600/20 border-red-500/30 text-red-400'
    };

    return (
      <div className={`relative p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            {change && (
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
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
      </div>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'added': return <Package className="w-4 h-4 text-emerald-400" />;
      case 'updated': return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'removed': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'restocked': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default: return <Eye className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time inventory overview and system status</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 text-sm font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={data.stats.totalProducts}
          change="+12%"
          icon={Package}
          color="cyan"
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(data.stats.totalValue)}
          change="+8.2%"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={data.stats.lowStockItems}
          change="-3"
          icon={AlertTriangle}
          trend="down"
          color="amber"
        />
        <StatCard
          title="Out of Stock"
          value={data.stats.outOfStockItems}
          change="+1"
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-700/20 hover:bg-slate-700/30 transition-colors duration-200">
                    <div className="flex-shrink-0 p-2 rounded-full bg-slate-700/50">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{activity.productName}</p>
                      <p className="text-slate-400 text-sm mt-1">{activity.details}</p>
                      <p className="text-slate-500 text-xs mt-2">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white">Category Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(data.stats.categories).map(([category, count]) => {
                const percentage = (count / data.stats.totalProducts) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{category}</span>
                      <span className="text-cyan-400">{count} items</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;