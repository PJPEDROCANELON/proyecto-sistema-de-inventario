// C:\Users\pedro\Desktop\project\src\services\InventoryService.ts

import apiClient from '../api/apiClient';
import { 
  Product, 
  InventoryQueryParams, 
  InventoryApiResponse, 
  StockAlert,
  RealtimeUpdate,
  InventoryStats,
  GetInventoryItemsResponse // Asegurarse de importar esta interfaz
} from '../types';

const InventoryService = {
  getInventoryItems: async (filters: InventoryQueryParams = {}): Promise<GetInventoryItemsResponse> => {
    try {
      const response = await apiClient.post<InventoryApiResponse<Product>>('/inventory/query', filters);
      return {
        items: response.data.data.items,
        totalCount: response.data.data.totalCount,
        currentPage: response.data.data.currentPage,
        totalPages: response.data.data.totalPages,
        hasNextPage: response.data.data.hasNextPage ?? false,
        hasPreviousPage: response.data.data.hasPreviousPage ?? false,
      };
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error('Failed to fetch inventory items.');
    }
  },

  createItem: async (itemData: Omit<Product, 'id' | 'createdAt' | 'lastUpdated' | 'quantumId'>): Promise<Product> => {
    try {
      const response = await apiClient.post<Product>('/inventory/items', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product.');
    }
  },

  updateItem: async (itemId: number, updates: Partial<Product>): Promise<Product> => {
    try {
      const response = await apiClient.put<Product>(`/inventory/items/${itemId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product.');
    }
  },

  deleteItem: async (itemId: number): Promise<void> => {
    try {
      await apiClient.delete(`/inventory/items/${itemId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product.');
    }
  },

  getItemById: async (itemId: number): Promise<Product> => {
    try {
      const response = await apiClient.get<Product>(`/inventory/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw new Error('Failed to fetch product by ID.');
    }
  },

  subscribeToInventoryUpdates: (_callback: (update: RealtimeUpdate) => void): (() => void) => {
    // Usar el parámetro para silenciar la advertencia de ESLint
    console.log('Mock: Subscribing to inventory updates. Callback:', _callback); 
    console.warn('Real-time updates not fully implemented in InventoryService. Connect to WebSocket for production.');
    const unsubscribe = () => {
      console.log('Unsubscribed from mock inventory updates.');
    };
    return unsubscribe;
  },

  getInventoryAnalytics: async (_timeRange: string): Promise<InventoryStats> => {
    // Usar el parámetro para silenciar la advertencia de ESLint
    console.log('Mock: Getting inventory analytics for time range:', _timeRange);
    console.warn('Inventory analytics API not fully implemented. Returning mock data.');
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return {
      totalProducts: 100,
      totalValue: 500000,
      lowStockItems: 15,
      outOfStockItems: 5,
      categories: {
        'Technology': 40,
        'Components': 30,
        'Supplies': 20,
        'Materials': 10
      },
      totalItems: 100 // Asegúrate de que coincida con la interfaz InventoryStats
    };
  },

  getStockAlerts: async (): Promise<StockAlert[]> => {
    console.warn('Stock alerts API not fully implemented. Returning mock data.');
    await new Promise(resolve => setTimeout(resolve, 300)); 
    return [
      { id: 1, itemId: 2, type: 'low_stock', severity: 'medium', message: 'Holographic Display Matrix is low on stock', threshold: 15, currentValue: 8, timestamp: new Date().toISOString(), acknowledged: false },
      { id: 2, itemId: 3, type: 'out_of_stock', severity: 'critical', message: 'Neural Interface Cables are out of stock', threshold: 25, currentValue: 0, timestamp: new Date().toISOString(), acknowledged: false },
    ];
  },
};

export default InventoryService;
