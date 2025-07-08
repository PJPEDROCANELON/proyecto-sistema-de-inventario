// C:\Users\pedro\Desktop\project\src\components\settings\InventorySettings.tsx

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { toast } from 'react-toastify';

interface InventorySettingsProps {
  currentUser: User | null;
  onSaveInventorySettings: (settings: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// NUEVO: Definir las opciones de moneda
const CURRENCY_OPTIONS = [
  { label: 'Dólar Americano ($)', value: '$' },
  { label: 'Bolívar Venezolano (Bs)', value: 'Bs' },
  { label: 'Yuan Chino (¥)', value: '¥' },
  { label: 'Euro (€)', value: '€' },
  // Puedes añadir más monedas aquí si es necesario
];

const InventorySettings: React.FC<InventorySettingsProps> = ({
  currentUser,
  onSaveInventorySettings,
  isLoading,
  error,
}) => {
  const [minStockThreshold, setMinStockThreshold] = useState(currentUser?.defaultMinStockThreshold ?? 5);
  const [overstockMultiplier, setOverstockMultiplier] = useState(currentUser?.defaultOverstockMultiplier ?? 2);
  const [quantityUnit, setQuantityUnit] = useState(currentUser?.defaultQuantityUnit ?? 'units');
  // MODIFICADO: Inicializar con el valor de currentUser o un valor predeterminado seguro
  const [currencySymbol, setCurrencySymbol] = useState(currentUser?.defaultCurrencySymbol ?? '$'); 
  const [dateFormat, setDateFormat] = useState(currentUser?.defaultDateFormat ?? 'DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState(currentUser?.defaultTimeFormat ?? 'HH:mm');
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar estados locales con las props de currentUser
  useEffect(() => {
    if (currentUser) {
      setMinStockThreshold(currentUser.defaultMinStockThreshold);
      setOverstockMultiplier(currentUser.defaultOverstockMultiplier);
      setQuantityUnit(currentUser.defaultQuantityUnit);
      // Asegurarse de que el símbolo de moneda del usuario exista en las opciones, si no, usar el primero
      const userCurrency = currentUser.defaultCurrencySymbol;
      const isValidCurrency = CURRENCY_OPTIONS.some(option => option.value === userCurrency);
      setCurrencySymbol(isValidCurrency ? userCurrency : CURRENCY_OPTIONS[0].value);
      
      setDateFormat(currentUser.defaultDateFormat);
      setTimeFormat(currentUser.defaultTimeFormat);
    }
  }, [currentUser]);

  // Efecto para detectar cambios y habilitar el botón de guardar
  useEffect(() => {
    const initialMinStock = currentUser?.defaultMinStockThreshold ?? 5;
    const initialOverstock = currentUser?.defaultOverstockMultiplier ?? 2;
    const initialQuantityUnit = currentUser?.defaultQuantityUnit ?? 'units';
    const initialCurrency = currentUser?.defaultCurrencySymbol ?? CURRENCY_OPTIONS[0].value; // Usar la primera opción como fallback
    const initialDateFormat = currentUser?.defaultDateFormat ?? 'DD/MM/YYYY';
    const initialTimeFormat = currentUser?.defaultTimeFormat ?? 'HH:mm';

    if (
      minStockThreshold !== initialMinStock ||
      overstockMultiplier !== initialOverstock ||
      quantityUnit !== initialQuantityUnit ||
      currencySymbol !== initialCurrency || // Comparar con el valor inicial
      dateFormat !== initialDateFormat ||
      timeFormat !== initialTimeFormat
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [
    minStockThreshold,
    overstockMultiplier,
    quantityUnit,
    currencySymbol, // Incluir en las dependencias
    dateFormat,
    timeFormat,
    currentUser 
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.info('No hay cambios en la configuración de inventario para guardar.');
      return;
    }

    if (!currentUser) {
      toast.error('No hay usuario autenticado para guardar las preferencias de inventario.');
      return;
    }

    try {
      // Validaciones básicas
      if (minStockThreshold < 0) {
        toast.error('El umbral de stock mínimo no puede ser negativo.');
        return;
      }
      if (overstockMultiplier < 1) {
        toast.error('El multiplicador de sobre stock debe ser al menos 1.');
        return;
      }

      await onSaveInventorySettings({
        defaultMinStockThreshold: minStockThreshold,
        defaultOverstockMultiplier: overstockMultiplier,
        defaultQuantityUnit: quantityUnit,
        defaultCurrencySymbol: currencySymbol, // Guardar el valor seleccionado
        defaultDateFormat: dateFormat,
        defaultTimeFormat: timeFormat,
      });
      setHasChanges(false); 
    } catch (err: unknown) {
      console.error('❌ Error al guardar configuración de inventario en InventorySettings:', err);
      throw err;
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Configuración General de Inventario</h3>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Umbrales de Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minStockThreshold" className="block text-sm font-medium text-slate-300 mb-1">Umbral de Stock Mínimo</label>
            <input
              type="number"
              id="minStockThreshold"
              value={minStockThreshold}
              onChange={(e) => setMinStockThreshold(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isLoading}
              min="0"
            />
          </div>
          <div>
            <label htmlFor="overstockMultiplier" className="block text-sm font-medium text-slate-300 mb-1">Multiplicador de Sobre Stock</label>
            <input
              type="number"
              id="overstockMultiplier"
              value={overstockMultiplier}
              onChange={(e) => setOverstockMultiplier(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:focus:border-purple-500/50 transition-all duration-200"
              disabled={isLoading}
              min="1"
            />
          </div>
        </div>

        {/* Unidades y Moneda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantityUnit" className="block text-sm font-medium text-slate-300 mb-1">Unidad de Cantidad Predeterminada</label>
            <input
              type="text"
              id="quantityUnit"
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              placeholder="ej. unidades, kg, litros"
              disabled={isLoading}
            />
          </div>
          {/* MODIFICADO: Selector para Símbolo de Moneda */}
          <div>
            <label htmlFor="currencySymbol" className="block text-sm font-medium text-slate-300 mb-1">Símbolo de Moneda</label>
            <select
              id="currencySymbol"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isLoading}
            >
              {CURRENCY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formato de Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-slate-300 mb-1">Formato de Fecha Predeterminado</label>
            <select
              id="dateFormat"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isLoading}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (ej. 25/12/2023)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (ej. 12/25/2023)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ej. 2023-12-25)</option>
            </select>
          </div>
          <div>
            <label htmlFor="timeFormat" className="block text-sm font-medium text-slate-300 mb-1">Formato de Hora Predeterminado</label>
            <select
              id="timeFormat"
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isLoading}
            >
              <option value="HH:mm">HH:mm (24h, ej. 14:30)</option>
              <option value="hh:mm A">hh:mm A (12h, ej. 02:30 PM)</option>
            </select>
          </div>
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
            'Guardar Configuración de Inventario'
          )}
        </button>
      </form>
    </div>
  );
};

export default InventorySettings;
