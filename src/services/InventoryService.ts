import ApiGateway from './ApiGateway';
import { Product } from '../types';

// Enhanced interfaces for backend integration
interface InventoryFilters {
  category?: string;
  status?: string;
  location?: string;
  minQuantity?: number;
  maxQuantity?: number;
  searchTerm?: string;
  sortBy?: 'name' | 'quantity' | 'lastUpdated' | 'value';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface InventoryResponse {
  items: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ItemMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  location: string;
  timestamp: string;
  user: string;
  reason?: string;
  quantumSignature: string;
}

interface StockAlert {
  id: string;
  itemId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
}

class InventoryService {
  private readonly baseEndpoint = '/api/inventory';

  // Core inventory operations
  async getInventoryItems(filters: InventoryFilters = {}): Promise<InventoryResponse> {
    try {
      const response = await ApiGateway.post(`${this.baseEndpoint}/query`, filters);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      throw error;
    }
  }

  async getItemById(itemId: string): Promise<Product> {
    try {
      const response = await ApiGateway.get(`${this.baseEndpoint}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch item ${itemId}:`, error);
      throw error;
    }
  }

  async createItem(itemData: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
    try {
      const quantumId = ApiGateway.generateQuantumId();
      const enhancedItemData = {
        ...itemData,
        quantumId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const response = await ApiGateway.post(`${this.baseEndpoint}/items`, enhancedItemData);
      return response.data;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw error;
    }
  }

  async updateItem(itemId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const updateData = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      const response = await ApiGateway.put(`${this.baseEndpoint}/items/${itemId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update item ${itemId}:`, error);
      throw error;
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    try {
      await ApiGateway.delete(`${this.baseEndpoint}/items/${itemId}`);
    } catch (error) {
      console.error(`Failed to delete item ${itemId}:`, error);
      throw error;
    }
  }

  // Stock movement operations
  async recordStockMovement(itemId: string, movement: Omit<ItemMovement, 'id' | 'timestamp' | 'quantumSignature'>): Promise<ItemMovement> {
    try {
      const movementData = {
        ...movement,
        timestamp: new Date().toISOString(),
        quantumSignature: ApiGateway.generateQuantumId()
      };

      const response = await ApiGateway.post(`${this.baseEndpoint}/items/${itemId}/movements`, movementData);
      return response.data;
    } catch (error) {
      console.error(`Failed to record stock movement for item ${itemId}:`, error);
      throw error;
    }
  }

  async getItemMovementHistory(itemId: string, limit: number = 50): Promise<ItemMovement[]> {
    try {
      const response = await ApiGateway.get(`${this.baseEndpoint}/items/${itemId}/movements?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch movement history for item ${itemId}:`, error);
      throw error;
    }
  }

  // Alert and monitoring operations
  async getStockAlerts(severity?: StockAlert['severity']): Promise<StockAlert[]> {
    try {
      const queryParams = severity ? `?severity=${severity}` : '';
      const response = await ApiGateway.get(`${this.baseEndpoint}/alerts${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error);
      throw error;
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await ApiGateway.patch(`${this.baseEndpoint}/alerts/${alertId}/acknowledge`);
    } catch (error) {
      console.error(`Failed to acknowledge alert ${alertId}:`, error);
      throw error;
    }
  }

  // Analytics and reporting
  async getInventoryAnalytics(timeRange: '24h' | '7d' | '30d' | '90d' = '30d'): Promise<any> {
    try {
      const response = await ApiGateway.get(`${this.baseEndpoint}/analytics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory analytics:', error);
      throw error;
    }
  }

  async generateInventoryReport(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> {
    try {
      const response = await ApiGateway.get(`${this.baseEndpoint}/reports/inventory?format=${format}`);
      return response.data;
    } catch (error) {
      console.error('Failed to generate inventory report:', error);
      throw error;
    }
  }

  // Batch operations
  async bulkUpdateItems(updates: Array<{ id: string; updates: Partial<Product> }>): Promise<Product[]> {
    try {
      const response = await ApiGateway.post(`${this.baseEndpoint}/bulk/update`, { updates });
      return response.data;
    } catch (error) {
      console.error('Failed to perform bulk update:', error);
      throw error;
    }
  }

  async importInventoryData(data: any[], format: 'csv' | 'json' | 'excel'): Promise<{ success: number; failed: number; errors: any[] }> {
    try {
      const response = await ApiGateway.post(`${this.baseEndpoint}/import`, { data, format });
      return response.data;
    } catch (error) {
      console.error('Failed to import inventory data:', error);
      throw error;
    }
  }

  // Real-time features (WebSocket integration)
  subscribeToInventoryUpdates(callback: (update: any) => void): () => void {
    // This would integrate with WebSocket for real-time updates
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const alerts = await this.getStockAlerts('high');
        if (alerts.length > 0) {
          callback({ type: 'alerts', data: alerts });
        }
      } catch (error) {
        console.error('Failed to fetch real-time updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }

  // Utility methods
  async validateItemData(itemData: Partial<Product>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!itemData.name || itemData.name.trim().length === 0) {
      errors.push('Item name is required');
    }

    if (!itemData.sku || itemData.sku.trim().length === 0) {
      errors.push('SKU is required');
    }

    if (itemData.quantity !== undefined && itemData.quantity < 0) {
      errors.push('Quantity cannot be negative');
    }

    if (itemData.price !== undefined && itemData.price < 0) {
      errors.push('Price cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async searchItems(query: string, options: { fuzzy?: boolean; limit?: number } = {}): Promise<Product[]> {
    try {
      const response = await ApiGateway.post(`${this.baseEndpoint}/search`, {
        query,
        fuzzy: options.fuzzy || false,
        limit: options.limit || 20
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search items:', error);
      throw error;
    }
  }
}

export default new InventoryService();