// C:\Users\pedro\Desktop\project\src\components\Alerts.tsx

import React from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  TrendingDown, 
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { User } from '../types'; // Asegúrate de que User esté importado correctamente

interface AlertProps {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  location: string;
  priority: string;
}

interface AlertsProps {
  user: User | null;
}

const Alerts: React.FC<AlertsProps> = ({ user }) => {
  const alerts: AlertProps[] = [
    {
      id: '1',
      type: 'critical',
      title: 'Neural Interface Cables - Out of Stock',
      description: 'Critical component completely depleted. Production line affected.',
      timestamp: '2024-01-15T16:45:00Z',
      location: 'Sector Gamma-1',
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Holographic Display Matrix - Low Stock',
      description: 'Only 8 units remaining. Below minimum threshold of 15.',
      timestamp: '2024-01-15T14:20:00Z',
      location: 'Sector Beta-3',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'info',
      title: 'Plasma Energy Cells - Overstocked',
      description: 'Inventory exceeds maximum capacity. Consider redistribution.',
      timestamp: '2024-01-15T11:30:00Z',
      location: 'Sector Delta-9',
      priority: 'low'
    },
    {
      id: '4',
      type: 'security',
      title: 'Unauthorized Access Attempt',
      description: 'Failed login attempt detected from unknown terminal.',
      timestamp: '2024-01-15T10:15:00Z',
      location: 'Terminal-7',
      priority: 'high'
    },
    {
      id: '5',
      type: 'maintenance',
      title: 'System Backup Completed',
      description: 'Automated system backup completed successfully.',
      timestamp: '2024-01-15T09:00:00Z',
      location: 'Data Center',
      priority: 'low'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'info':
        return <TrendingDown className="w-5 h-5 text-cyan-400" />;
      case 'security':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'maintenance':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'info':
        return 'border-cyan-500/30 bg-cyan-500/10';
      case 'security':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'maintenance':
        return 'border-emerald-500/30 bg-emerald-500/10';
      default:
        return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const criticalAlerts = alerts.filter(alert => alert.type === 'critical' || alert.priority === 'high');
  const otherAlerts = alerts.filter(alert => alert.type !== 'critical' && alert.priority !== 'high');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Alert Center</h1>
          <p className="text-slate-400 mt-1">Monitor system alerts and notifications</p>
          
          {/* Mensaje de usuario */}
          {user && (
            <p className="text-slate-300 mt-2 flex items-center">
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-sm">
                Alertas para: {user.username} {/* CORRECCIÓN: user.username */}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">{criticalAlerts.length} Critical</span>
            </div>
          </div>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300">
            Mark All Read
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Critical Alerts ({criticalAlerts.length})
          </h2>
          <div className="space-y-4">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 rounded-xl border backdrop-blur-sm ${getAlertColor(alert.type)} hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full bg-slate-700/50">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(alert.timestamp)}
                        </div>
                        <div>Location: {alert.location}</div>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-300">All Alerts</h2>
        <div className="space-y-4">
          {otherAlerts.map((alert) => (
            <div key={alert.id} className={`p-6 rounded-xl border backdrop-blur-sm ${getAlertColor(alert.type)} hover:scale-[1.01] transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 rounded-full bg-slate-700/50">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{alert.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-3">{alert.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(alert.timestamp)}
                      </div>
                      <div>Location: {alert.location}</div>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Critical</p>
              <p className="text-xl font-bold text-white">{alerts.filter(a => a.type === 'critical').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Warning</p>
              <p className="text-xl font-bold text-white">{alerts.filter(a => a.type === 'warning').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <TrendingDown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Info</p>
              <p className="text-xl font-bold text-white">{alerts.filter(a => a.type === 'info').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Security</p>
              <p className="text-xl font-bold text-white">{alerts.filter(a => a.type === 'security').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
