// C:\Users\pedro\Desktop\project\src\hooks\useInventory.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query'; 
import inventoryService from '../api/inventoryService';
import { InventoryQueryOptions, PaginatedResponse, Product, InventoryStats, InventoryAlert } from '../types';

/**
 * Hook para obtener productos de inventario.
 * @param options Opciones de consulta para paginación y filtros.
 * @param refreshKey Opcional. Una clave numérica que, al cambiar, fuerza un re-fetch de los datos.
 */
export const useInventory = (options: InventoryQueryOptions, refreshKey?: number): { // AÑADIDO: refreshKey como segundo argumento
  items: Product[];
  totalCount: number;
  pagination?: PaginatedResponse<Product>['pagination']; // pagination puede ser undefined inicialmente
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: UseQueryResult<PaginatedResponse<Product>, Error>['refetch'];
  isFetching: boolean;
} => {
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useQuery<PaginatedResponse<Product>, Error>({
    // AÑADIDO: Incluir refreshKey en la queryKey. Esto hará que la consulta se refetch cuando cambie.
    queryKey: ['products', options.page, options.limit, options.searchTerm, options.category, options.status, refreshKey],
    queryFn: () => inventoryService.getProducts(options),
    placeholderData: (previousData) => previousData, 
    staleTime: 5 * 60 * 1000, 
  });

  return {
    items: data?.items || [],
    totalCount: data?.totalCount || 0,
    pagination: data?.pagination,
    isLoading,
    isError,
    error: error || null, 
    refetch,
    isFetching,
  };
};

/**
 * Hook para obtener las analíticas del inventario.
 * @param timeRange Opcional: un rango de tiempo como '7d', '30d', etc. (actualmente no usado por el backend).
 */
export const useInventoryAnalytics = (timeRange?: string) => { 
  const { data, isLoading, isError, error } = useQuery<InventoryStats, Error>({
    queryKey: ['inventoryAnalytics', timeRange], 
    queryFn: () => inventoryService.getInventoryAnalytics(), 
    staleTime: 5 * 60 * 1000, 
  });

  return { data, isLoading, isError, error };
};

/**
 * Hook para obtener las alertas del inventario.
 */
export const useInventoryAlerts = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<InventoryAlert[], Error>({
    queryKey: ['inventoryAlerts'],
    queryFn: () => inventoryService.getInventoryAlerts(),
    staleTime: 15 * 1000, 
    refetchInterval: 15 * 1000, 
    refetchIntervalInBackground: true, 
  });

  return { alerts: data || [], isLoading, isError, error, refetch };
};
