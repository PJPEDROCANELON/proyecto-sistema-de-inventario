// C:\Users\pedro\Desktop\project\src\components\AlertCard.tsx
import React from 'react';
import { AlertTriangle, Package, CheckCircle, XCircle } from 'lucide-react';
import { InventoryAlert, ProductStatus } from '../types';

interface AlertCardProps {
  alert: InventoryAlert;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case 'Low Stock':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'Out of Stock':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'In Stock':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg flex items-start gap-4 border border-slate-600/50">
      <div className="flex-shrink-0 mt-1">
        {getStatusIcon(alert.status)}
      </div>
      <div className="flex-grow">
        <h4 className="text-white font-medium text-lg mb-1">{alert.name}</h4>
        <p className="text-slate-300 text-sm">{alert.status} - SKU: {alert.sku} - Cantidad: {alert.quantity}</p>
        {alert.minStock !== undefined && (
          <p className="text-slate-400 text-xs mt-1">Stock Mínimo: {alert.minStock}</p>
        )}
        <p className="text-slate-500 text-xs mt-1">Última actualización: {new Date(alert.lastUpdated).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AlertCard;