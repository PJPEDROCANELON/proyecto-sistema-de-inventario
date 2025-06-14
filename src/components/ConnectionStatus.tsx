import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, Zap } from 'lucide-react';
import ApiGateway from '../services/ApiGateway';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'offline' | 'unstable'>('online');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const connectionStatus = ApiGateway.getConnectionStatus();
      setStatus(connectionStatus);
      
      // Show status indicator when connection is not optimal
      setIsVisible(connectionStatus !== 'online');
    };

    // Initial check
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 5000);

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus('online');
      setIsVisible(false);
    };

    const handleOffline = () => {
      setStatus('offline');
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          message: 'Connection Lost',
          description: 'NeoStock servers unreachable'
        };
      case 'unstable':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/30',
          message: 'Unstable Connection',
          description: 'Experiencing connectivity issues'
        };
      default:
        return {
          icon: Wifi,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/30',
          message: 'Connected',
          description: 'All systems operational'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.bgColor} ${config.borderColor} border backdrop-blur-sm rounded-lg p-4 shadow-lg transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h4 className={`font-medium ${config.color}`}>{config.message}</h4>
          <p className="text-slate-400 text-sm">{config.description}</p>
        </div>
        {status === 'offline' && (
          <div className="ml-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;