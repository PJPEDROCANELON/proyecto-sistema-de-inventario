// C:\Users\pedro\Desktop\project\src\components\settings\ExchangeRateSettings.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import exchangeRateService from '../../api/exchangeRateService'; // CAMBIO: Ahora importa desde .ts
import { NeoStockResponse, ExchangeRate } from '../../types'; 
import { DollarSign, TrendingUp, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importación de locale 'es'

// CAMBIO: Eliminada la interfaz vacía ExchangeRateSettingsProps
// interface ExchangeRateSettingsProps {}

// CAMBIO: Componente ahora es React.FC sin props específicas
const ExchangeRateSettings: React.FC = () => {
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string>(format(new Date(), 'yyyy-MM-dd')); // Fecha actual por defecto
  const [newRateInput, setNewRateInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: NeoStockResponse<ExchangeRate> = await exchangeRateService.getLatestExchangeRate('USD', 'Bs');
      if (response.success && response.data) {
        setCurrentRate(Number(response.data.rate));
        // Si la tasa es de hoy, precargar el input con esa tasa
        if (response.data.date === format(new Date(), 'yyyy-MM-dd', { locale: es })) { // CAMBIO: Usar locale 'es'
          setNewRateInput(String(Number(response.data.rate)));
        } else {
          setNewRateInput(''); // Si la última tasa no es de hoy, dejar el campo vacío
        }
      } else {
        setCurrentRate(null);
        setNewRateInput('');
        setError(response.message || 'No se pudo obtener la última tasa de cambio.');
      }
    } catch (err) {
      console.error('Error al cargar la última tasa de cambio:', err);
      setError('Error de conexión al obtener la tasa de cambio.');
      setCurrentRate(null);
      setNewRateInput('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestRate();
  }, [fetchLatestRate]);

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rateValue = parseFloat(newRateInput);

    if (isNaN(rateValue) || rateValue <= 0) {
      toast.error('Por favor, ingresa una tasa de cambio válida y positiva.', { theme: "dark" });
      return;
    }
    if (!rateDate) {
      toast.error('Por favor, selecciona una fecha para la tasa de cambio.', { theme: "dark" });
      return;
    }

    setIsLoading(true);
    try {
      const response: NeoStockResponse<ExchangeRate> = await exchangeRateService.addExchangeRate(
        rateDate,
        rateValue,
        'USD',
        'Bs'
      );

      if (response.success && response.data) {
        toast.success('Tasa de cambio registrada correctamente.', { theme: "dark" });
        setCurrentRate(Number(response.data.rate));
        setNewRateInput(''); // Limpiar el input después de guardar
        fetchLatestRate(); // Volver a cargar la última tasa para asegurar que se muestre la recién añadida
      } else {
        toast.error(response.message || 'Error al registrar la tasa de cambio.', { theme: "dark" });
        setError(response.message || 'Error desconocido al registrar la tasa.');
      }
    } catch (err) {
      console.error('Error al añadir la tasa de cambio:', err);
      toast.error('Error de conexión al registrar la tasa de cambio.', { theme: "dark" });
      setError('Error de conexión al registrar la tasa de cambio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 text-white space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-emerald-400" /> Gestión de Tasas de Cambio (USD a Bs)
      </h3>
      <p className="text-slate-400 mb-4">
        Registra la tasa de cambio diaria de Dólares Estadounidenses (USD) a Bolívares (Bs). Esta tasa se utilizará para las conversiones de precios en todo el sistema.
      </p>

      {/* Sección de Tasa Actual */}
      <div className="bg-slate-700/50 p-4 rounded-lg flex items-center gap-4">
        <TrendingUp className="w-8 h-8 text-cyan-400" />
        <div>
          <p className="text-slate-300 text-sm">Última Tasa Registrada (USD a Bs)</p>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : error && !currentRate ? (
            <p className="text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</p>
          ) : currentRate !== null ? (
            <p className="text-2xl font-bold text-white">1 USD = Bs {currentRate.toFixed(4)}</p>
          ) : (
            <p className="text-slate-400">No hay tasas registradas.</p>
          )}
        </div>
      </div>

      {/* Formulario para Añadir Nueva Tasa */}
      <form onSubmit={handleAddRate} className="space-y-4 bg-slate-700/50 p-6 rounded-lg border border-slate-600/50">
        <h4 className="font-semibold text-white mb-3">Registrar Nueva Tasa</h4>
        
        <div>
          <label htmlFor="rate-date" className="block text-sm font-medium text-slate-300 mb-1">Fecha de la Tasa</label>
          <div className="relative">
            <input
              type="date"
              id="rate-date"
              value={rateDate}
              onChange={(e) => setRateDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              disabled={isLoading}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="new-rate" className="block text-sm font-medium text-slate-300 mb-1">Tasa de Cambio (1 USD a Bs)</label>
          <input
            type="number"
            id="new-rate"
            value={newRateInput}
            onChange={(e) => setNewRateInput(e.target.value)}
            step="0.0001" // Permite decimales para la tasa
            min="0.0001"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
            placeholder="Ej: 36.50"
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            !isLoading
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin h-5 w-5 mr-3 text-white" />Registrando...
            </span>
          ) : (
            'Registrar Tasa'
          )}
        </button>
      </form>
    </div>
  );
};

export default ExchangeRateSettings;