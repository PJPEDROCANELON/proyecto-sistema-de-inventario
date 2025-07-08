// C:\Users\pedro\Desktop\project\src\api\inventoryService.ts

import axios from 'axios';
import { 
  Product, 
  PaginatedResponse, 
  InventoryQueryOptions, 
  InventoryStats, 
  InventoryAlert, 
  NeoStockResponse,
  Order, 
  OrderItem 
} from '../types'; 

// La URL base de tu API Backend
// Usar un prefijo '/api' para todas las rutas del backend si es consistente.
const API_BASE_URL = 'http://localhost:3001/api'; 

// Crear una instancia de Axios para poder configurar interceptores
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// INTERCEPTOR DE SOLICITUDES: Añadir el token JWT a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class InventoryService {
  // --- Métodos de Inventario ---

  async getProducts(options: InventoryQueryOptions): Promise<PaginatedResponse<Product>> {
    try {
      const response = await axiosInstance.get<NeoStockResponse<PaginatedResponse<Product>>>(`/inventory/products`, { 
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

  async addProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await axiosInstance.post<NeoStockResponse<Product>>(`/inventory/products`, productData); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al añadir producto');
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await axiosInstance.put<NeoStockResponse<Product>>(`/inventory/products/${id}`, productData); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al actualizar producto');
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await axiosInstance.delete<NeoStockResponse<null>>(`/inventory/products/${id}`); 
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }

  async getInventoryAnalytics(): Promise<InventoryStats> {
    try {
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

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
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

  // --- Métodos de Órdenes ---

  /**
   * Registra una venta creando una nueva orden en el backend.
   * @param saleData Datos de la venta, incluyendo productId, quantity, priceAtSale, etc.
   * @returns Una promesa que resuelve con la orden creada y el OrderItem.
   */
  async recordSale(saleData: { productId: number; quantity: number; priceAtSale: number; deliveryDateExpected?: string; notes?: string; }): Promise<{ order: Order; orderItem: OrderItem }> {
    try {
      const response = await axiosInstance.post<NeoStockResponse<{ order: Order; orderItem: OrderItem }>>(`/inventory/products/sale`, saleData); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al registrar la venta');
    } catch (error) {
      console.error('Error recording sale:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva orden con múltiples ítems.
   * @param orderData Datos de la orden, incluyendo userId y un array de orderItems.
   * @returns Una promesa que resuelve con la orden creada.
   */
  async createOrder(orderData: Omit<Order, 'id' | 'totalAmount' | 'status' | 'createdAt' | 'updatedAt' | 'deliveryStatus'> & { orderItems: Omit<OrderItem, 'id' | 'orderId' | 'productName' | 'sku' | 'category'>[] }): Promise<Order> {
    try {
      const response = await axiosInstance.post<NeoStockResponse<Order>>(`/orders`, orderData); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al crear la orden');
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Obtiene una lista paginada y filtrada de órdenes.
   * @param options Opciones de paginación y filtro para órdenes.
   * @returns Una promesa que resuelve con las órdenes paginadas.
   */
  async getOrders(options?: { page?: number; limit?: number; status?: string; searchTerm?: string }): Promise<PaginatedResponse<Order>> {
    try {
      const response = await axiosInstance.get<NeoStockResponse<PaginatedResponse<Order>>>(`/orders`, { params: options }); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener órdenes');
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Obtiene los detalles de una orden específica por su ID.
   * @param id El ID de la orden a obtener.
   * @returns Una promesa que resuelve con los detalles de la orden.
   */
  async getOrderById(id: number): Promise<Order> {
    try {
      const response = await axiosInstance.get<NeoStockResponse<Order>>(`/orders/${id}`); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener la orden');
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el estado o detalles de una orden existente.
   * @param id El ID de la orden a actualizar.
   * @param orderData Los datos parciales de la orden a actualizar.
   * @returns Una promesa que resuelve con la orden actualizada.
   */
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await axiosInstance.put<NeoStockResponse<Order>>(`/orders/${id}`, orderData); 
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al actualizar la orden');
    } catch (error) {
      console.error(`Error updating order with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Método específico para actualizar solo el estado de una orden.
   * @param orderId El ID de la orden a actualizar.
   * @param status El nuevo estado de la orden.
   * @returns Una promesa que resuelve con la orden actualizada.
   */
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    try {
      // Usar la ruta específica para actualizar el estado de una orden.
      const response = await axiosInstance.put<NeoStockResponse<Order>>(`/orders/${orderId}/status`, { status: status });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al actualizar el estado de la orden.');
    } catch (error) {
      console.error(`Error updating status for order with ID ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una orden existente.
   * @param id El ID de la orden a eliminar.
   * @returns Una promesa que resuelve cuando la orden es eliminada.
   */
  async deleteOrder(id: number): Promise<void> {
    try {
      const response = await axiosInstance.delete<NeoStockResponse<null>>(`/orders/${id}`); 
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar la orden');
      }
    } catch (error) {
      console.error(`Error deleting order with ID ${id}:`, error);
      throw error;
    }
  }
}

// Exporta una instancia de la clase para que pueda ser importada y utilizada directamente
export default new InventoryService();
