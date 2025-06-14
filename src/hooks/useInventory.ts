import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import InventoryService from '../services/InventoryService';
import { Product } from '../types';
import { mockProducts } from '../data/mockData';

// Custom hook for inventory management with React Query integration
export const useInventory = (filters: any = {}) => {
  const queryClient = useQueryClient();
  const isMockMode = import.meta.env.VITE_MOCK_DATA_ENABLED === 'true';

  // Query for fetching inventory items
  const {
    data: inventoryData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['inventory', filters],
    async () => {
      if (isMockMode) {
        // Return mock data in production-like format
        return {
          items: mockProducts.filter(item => {
            if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
            if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
            if (filters.searchTerm) {
              const searchLower = filters.searchTerm.toLowerCase();
              return item.name.toLowerCase().includes(searchLower) || 
                     item.sku.toLowerCase().includes(searchLower);
            }
            return true;
          }),
          totalCount: mockProducts.length,
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
      return await InventoryService.getInventoryItems(filters);
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3
    }
  );

  // Mutation for creating new items
  const createItemMutation = useMutation(
    (itemData: Omit<Product, 'id' | 'lastUpdated'>) => {
      if (isMockMode) {
        // Simulate API call in mock mode
        return Promise.resolve({
          ...itemData,
          id: `mock-${Date.now()}`,
          lastUpdated: new Date().toISOString()
        } as Product);
      }
      return InventoryService.createItem(itemData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['dashboard']);
      },
      onError: (error) => {
        console.error('Failed to create item:', error);
      }
    }
  );

  // Mutation for updating items
  const updateItemMutation = useMutation(
    ({ itemId, updates }: { itemId: string; updates: Partial<Product> }) => {
      if (isMockMode) {
        return Promise.resolve({ ...updates, id: itemId } as Product);
      }
      return InventoryService.updateItem(itemId, updates);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['dashboard']);
      }
    }
  );

  // Mutation for deleting items
  const deleteItemMutation = useMutation(
    (itemId: string) => {
      if (isMockMode) {
        return Promise.resolve();
      }
      return InventoryService.deleteItem(itemId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['dashboard']);
      }
    }
  );

  return {
    // Data
    items: inventoryData?.items || [],
    totalCount: inventoryData?.totalCount || 0,
    pagination: {
      currentPage: inventoryData?.currentPage || 1,
      totalPages: inventoryData?.totalPages || 1,
      hasNextPage: inventoryData?.hasNextPage || false,
      hasPreviousPage: inventoryData?.hasPreviousPage || false
    },

    // Loading states
    isLoading,
    isCreating: createItemMutation.isLoading,
    isUpdating: updateItemMutation.isLoading,
    isDeleting: deleteItemMutation.isLoading,

    // Error states
    error,
    createError: createItemMutation.error,
    updateError: updateItemMutation.error,
    deleteError: deleteItemMutation.error,

    // Actions
    refetch,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,

    // Utility functions
    reset: () => {
      createItemMutation.reset();
      updateItemMutation.reset();
      deleteItemMutation.reset();
    }
  };
};

// Hook for real-time inventory updates
export const useInventoryUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (import.meta.env.VITE_MOCK_DATA_ENABLED === 'true') {
      // Simulate real-time updates in mock mode
      const interval = setInterval(() => {
        const mockUpdate = {
          type: 'stock_change',
          itemId: mockProducts[Math.floor(Math.random() * mockProducts.length)].id,
          timestamp: new Date().toISOString(),
          data: {
            quantityChange: Math.floor(Math.random() * 10) - 5
          }
        };
        setUpdates(prev => [mockUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }

    // Real-time subscription for production
    const unsubscribe = InventoryService.subscribeToInventoryUpdates((update) => {
      setUpdates(prev => [update, ...prev.slice(0, 9)]);
      
      // Invalidate relevant queries
      if (update.type === 'inventory_change') {
        queryClient.invalidateQueries(['inventory']);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    updates,
    clearUpdates: () => setUpdates([])
  };
};

// Hook for inventory analytics
export const useInventoryAnalytics = (timeRange: '24h' | '7d' | '30d' | '90d' = '30d') => {
  const isMockMode = import.meta.env.VITE_MOCK_DATA_ENABLED === 'true';

  return useQuery(
    ['inventory-analytics', timeRange],
    async () => {
      if (isMockMode) {
        // Return mock analytics data
        return {
          totalValue: mockProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0),
          totalItems: mockProducts.length,
          lowStockItems: mockProducts.filter(item => item.status === 'Low Stock').length,
          outOfStockItems: mockProducts.filter(item => item.status === 'Out of Stock').length,
          categoryDistribution: mockProducts.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          trends: {
            stockMovements: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              movements: Math.floor(Math.random() * 50) + 10
            })).reverse()
          }
        };
      }
      return await InventoryService.getInventoryAnalytics(timeRange);
    },
    {
      staleTime: 300000, // 5 minutes
      cacheTime: 600000, // 10 minutes
    }
  );
};

// Hook for stock alerts
export const useStockAlerts = () => {
  const isMockMode = import.meta.env.VITE_MOCK_DATA_ENABLED === 'true';

  return useQuery(
    ['stock-alerts'],
    async () => {
      if (isMockMode) {
        // Generate mock alerts based on current inventory
        return mockProducts
          .filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock')
          .map(item => ({
            id: `alert-${item.id}`,
            itemId: item.id,
            type: item.status === 'Out of Stock' ? 'out_of_stock' : 'low_stock',
            severity: item.status === 'Out of Stock' ? 'critical' : 'medium',
            message: `${item.name} is ${item.status.toLowerCase()}`,
            threshold: item.minStock,
            currentValue: item.quantity,
            timestamp: new Date().toISOString(),
            acknowledged: false
          }));
      }
      return await InventoryService.getStockAlerts();
    },
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 30000
    }
  );
};