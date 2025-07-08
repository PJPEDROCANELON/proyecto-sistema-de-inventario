// C:\Users\pedro\Desktop\project\src\api\merchandiseInflowService.ts

import apiClient from './apiClient'; // Importa la instancia de Axios configurada
import {
  NeoStockResponse,
  PaginatedResponse,
  MerchandiseInflow,
  MerchandiseInflowQueryOptions,
  Product // Necesario para buscar productos en el formulario
} from '../types';

const MERCHANDISE_INFLOW_API_BASE_URL = '/merchandise-inflow';
const PRODUCTS_API_BASE_URL = '/inventory/products'; // Necesario para la búsqueda de productos

const merchandiseInflowService = {
  /**
   * Registra una nueva entrada de mercadería en el sistema.
   * @param {MerchandiseInflow} data - Los datos de la entrada de mercadería a crear.
   * @returns {Promise<NeoStockResponse<MerchandiseInflow>>} Respuesta de la API con la entrada creada.
   */
  createMerchandiseInflow: async (data: MerchandiseInflow): Promise<NeoStockResponse<MerchandiseInflow>> => {
    try {
      const response = await apiClient.post<NeoStockResponse<MerchandiseInflow>>(MERCHANDISE_INFLOW_API_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear entrada de mercadería:', error);
      throw error;
    }
  },

  /**
   * Obtiene una lista paginada de entradas de mercadería.
   * @param {MerchandiseInflowQueryOptions} options - Opciones de consulta para paginación y filtros.
   * @returns {Promise<NeoStockResponse<PaginatedResponse<MerchandiseInflow>>>} Respuesta de la API con las entradas.
   */
  getMerchandiseInflows: async (options: MerchandiseInflowQueryOptions): Promise<NeoStockResponse<PaginatedResponse<MerchandiseInflow>>> => {
    try {
      // Construye los parámetros de la URL dinámicamente
      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));
      if (options.searchTerm) params.append('searchTerm', options.searchTerm);
      if (options.supplier) params.append('supplier', options.supplier);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await apiClient.get<NeoStockResponse<PaginatedResponse<MerchandiseInflow>>>(
        `${MERCHANDISE_INFLOW_API_BASE_URL}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas de mercadería:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una entrada de mercadería específica por su ID.
   * @param {number} id - El ID de la entrada de mercadería.
   * @returns {Promise<NeoStockResponse<MerchandiseInflow>>} Respuesta de la API con los detalles de la entrada.
   */
  getMerchandiseInflowById: async (id: number): Promise<NeoStockResponse<MerchandiseInflow>> => {
    try {
      const response = await apiClient.get<NeoStockResponse<MerchandiseInflow>>(`${MERCHANDISE_INFLOW_API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrada de mercadería con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca productos en el inventario por un término de búsqueda.
   * Esto es útil para el selector de productos en el formulario de entrada de mercadería.
   * @param {string} searchTerm - El término de búsqueda.
   * @returns {Promise<NeoStockResponse<PaginatedResponse<Product>>>} Respuesta de la API con los productos encontrados.
   */
  searchProducts: async (searchTerm: string): Promise<NeoStockResponse<PaginatedResponse<Product>>> => {
    try {
      const response = await apiClient.get<NeoStockResponse<PaginatedResponse<Product>>>(
        `${PRODUCTS_API_BASE_URL}?searchTerm=${encodeURIComponent(searchTerm)}&limit=10` // Limita a 10 resultados para autocompletado
      );
      return response.data;
    } catch (error) {
      console.error(`Error al buscar productos con término '${searchTerm}':`, error);
      throw error;
    }
  }
};

export default merchandiseInflowService;
