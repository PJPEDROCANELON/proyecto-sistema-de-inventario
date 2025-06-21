import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import ApiGateway from '../services/ApiGateway'; // Importa la instancia de ApiGateway

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const checkConnection = async () => {
    try {
      // Usar el nuevo método getConnectionStatus de ApiGateway
      const status = await ApiGateway.getConnectionStatus(); 
      setIsConnected(status);
    } catch (error) {
      console.error('Failed to check API connection:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Verificar la conexión inmediatamente al montar el componente
    checkConnection();

    // Establecer un intervalo para verificar la conexión periódicamente (ej. cada 10 segundos)
    const interval = setInterval(checkConnection, 10000); 

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

  if (isConnected === null) {
    // Estado inicial mientras se verifica la conexión
    return (
      <div className="flex items-center text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full text-xs animate-pulse">
        <Wifi className="w-3 h-3 mr-1" />
        Verificando conexión...
      </div>
    );
  }

  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
      isConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
    }`}>
      {isConnected ? (
        <Wifi className="w-3 h-3 mr-1" />
      ) : (
        <WifiOff className="w-3 h-3 mr-1" />
      )}
      {isConnected ? 'Conectado a la red' : 'Sin conexión a la red'}
    </div>
  );
};

export default ConnectionStatus;
