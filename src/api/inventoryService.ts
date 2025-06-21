// C:\Users\pedro\Desktop\project\src\api\inventoryService.ts

import axios from 'axios';
import { Product, PaginatedResponse, InventoryQueryOptions, InventoryStats, InventoryAlert, NeoStockResponse } from '../types';

// La URL base de tu API Backend
const API_BASE_URL = 'http://localhost:3001/api/inventory';

// Crear una instancia de Axios para poder configurar interceptores
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// INTERCEPTOR DE SOLICITUDES: Añadir el token JWT a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Obtener el token del localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Añadir el token al encabezado Authorization
      // console.log('Interceptor: Token JWT añadido a la solicitud:', token); // Para depuración
    } else {
      // console.log('Interceptor: No se encontró token JWT en localStorage.'); // Para depuración
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class InventoryService {
  /**
   * Obtiene una lista paginada y filtrada de productos.
   * @param options Opciones de paginación, búsqueda y filtro.
   * @returns Una promesa que resuelve con los productos paginados.
   */
  async getProducts(options: InventoryQueryOptions): Promise<PaginatedResponse<Product>> {
    try {
      // Usar axiosInstance en lugar de axios directamente
      const response = await axiosInstance.get<NeoStockResponse<PaginatedResponse<Product>>>(`/products`, {
        params: options,
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener productos');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Añade un nuevo producto.
   * @param productData Los datos del producto a añadir.
   * @returns Una promesa que resuelve con el producto añadido.
   */
  async addProduct(productData: Partial<Product>): Promise<Product> {
    try {
      // Usar axiosInstance en lugar de axios directamente
      const response = await axiosInstance.post<NeoStockResponse<Product>>(`/products`, productData);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al añadir producto');
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  /**
   * Actualiza un producto existente.
   * @param id El ID del producto a actualizar.
   * @param productData Los datos parciales del producto a actualizar.
   * @returns Una promesa que resuelve con el producto actualizado.
   */
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    try {
      // Usar axiosInstance en lugar de axios directamente
      const response = await axiosInstance.put<NeoStockResponse<Product>>(`/products/${id}`, productData);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al actualizar producto');
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un producto.
   * @param id El ID del producto a eliminar.
   * @returns Una promesa que resuelve cuando el producto es eliminado.
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      // Usar axiosInstance en lugar de axios directamente
      const response = await axiosInstance.delete<NeoStockResponse<null>>(`/products/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas y analíticas generales del inventario.
   * @returns Una promesa que resuelve con las estadísticas del inventario.
   */
  async getInventoryAnalytics(): Promise<InventoryStats> {
    try {
      // Usar axiosInstance en lugar de axios directamente
      const response = await axiosInstance.get<NeoStockResponse<InventoryStats>>(`/analytics`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener analíticas del inventario');
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  }

  /**
   * NUEVO MÉTODO: Obtiene la lista de alertas de inventario.
   * @returns Una promesa que resuelve con un array de alertas de inventario.
   */
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
      // Usar axiosInstance en lugar de axios directamente
      const response = await axiosInstance.get<NeoStockResponse<InventoryAlert[]>>(`/alerts`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener alertas de inventario');
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  }
}

// Exporta una instancia de la clase para que pueda ser importada y utilizada directamente
export default new InventoryService();
