// C:\Users\pedro\Desktop\project\src\api\exchangeRateService.ts

import axios from 'axios'; // CAMBIO: Eliminada la importación de AxiosError
import { NeoStockResponse, ExchangeRate } from '../types'; 

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

const exchangeRateService = {
  /**
   * Añade una nueva tasa de cambio al backend.
   * @param {string} date - La fecha de la tasa (YYYY-MM-DD).
   * @param {number} rate - La tasa de cambio (ej. 36.5).
   * @param {string} fromCurrency - La moneda de origen (ej. 'USD').
   * @param {string} toCurrency - La moneda de destino (ej. 'Bs').
   * @returns {Promise<NeoStockResponse<ExchangeRate>>} - La respuesta de la API.
   */
  addExchangeRate: async (date: string, rate: number, fromCurrency: string = 'USD', toCurrency: string = 'Bs'): Promise<NeoStockResponse<ExchangeRate>> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<NeoStockResponse<ExchangeRate>>(
        `${API_URL}/exchange-rates`,
        { date, fromCurrency, toCurrency, rate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: unknown) { 
      console.error('❌ Error al añadir tasa de cambio:', error);
      let errorMessage = 'Error de conexión al añadir tasa de cambio.';
      if (axios.isAxiosError(error)) { 
        errorMessage = error.response?.data?.message || errorMessage;
      }
      return { success: false, data: null, message: errorMessage };
    }
  },

  /**
   * Obtiene la tasa de cambio más reciente para un par de monedas.
   * @param {string} fromCurrency - La moneda de origen (ej. 'USD').
   * @param {string} toCurrency - La moneda de destino (ej. 'Bs').
   * @returns {Promise<NeoStockResponse<ExchangeRate>>} - La respuesta de la API.
   */
  getLatestExchangeRate: async (fromCurrency: string = 'USD', toCurrency: string = 'Bs'): Promise<NeoStockResponse<ExchangeRate>> => {
    try {
      const response = await axios.get<NeoStockResponse<ExchangeRate>>(
        `${API_URL}/exchange-rates/latest`,
        {
          params: { fromCurrency, toCurrency },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: unknown) { 
      console.error('❌ Error al obtener la última tasa de cambio:', error);
      let errorMessage = 'Error de conexión al obtener la tasa de cambio.';
      if (axios.isAxiosError(error)) { 
        errorMessage = error.response?.data?.message || errorMessage;
      }
      return { success: false, data: null, message: errorMessage };
    }
  },
};

export default exchangeRateService;