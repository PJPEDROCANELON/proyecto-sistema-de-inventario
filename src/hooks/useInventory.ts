// C:\Users\pedro\Desktop\project\src\hooks\useInventory.ts

// Importa useQuery y UseQueryResult explícitamente desde @tanstack/react-query
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import InventoryService from '../api/inventoryService';
import { InventoryQueryOptions, PaginatedResponse, Product, InventoryStats, Pagination } from '../types/index';

// Define la interfaz para el valor de retorno de useInventory
interface UseInventoryResult {
  items: Product[];
  totalCount: number;
  pagination?: Pagination; // Puede ser undefined
  isLoading: boolean;
  error: Error | null;
  refetch: UseQueryResult<PaginatedResponse<Product>, Error>['refetch'];
  isFetching: boolean;
}

// Hook para obtener productos de inventario
export const useInventory = (options: InventoryQueryOptions = {}): UseInventoryResult => {
  // queryKey debe ser inmutable y bien tipado para que React Query detecte cambios
  // Asegúrate de que las opciones sean estables o serializables para que el queryKey no cambie inesperadamente
  const queryKey = ['inventoryProducts', options] as const; // 'as const' ayuda a TypeScript a inferir una tupla inmutable

  // useQuery en v5. Desestructuración de las propiedades de retorno.
  const { 
    data, 
    isLoading, 
    error, 
    refetch, 
    isFetching,
  } = useQuery<PaginatedResponse<Product>, Error, PaginatedResponse<Product>, typeof queryKey>({
    queryKey: queryKey, // Pasa el queryKey aquí
    queryFn: () => InventoryService.getProducts(options), // Llama al servicio con las opciones
    // placeholderData se pasa como una OPCIÓN dentro del objeto de configuración, no se desestructura del retorno
    placeholderData: (previousData) => previousData, // Función para mantener datos anteriores
    // staleTime: 0, // Descomenta si quieres que la consulta siempre sea "stale" y se refetch en cada mount
  });

  // Acceso seguro a las propiedades de 'data' con valores por defecto
  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const pagination = data?.pagination; // pagination puede ser undefined

  return {
    items,
    totalCount,
    pagination,
    isLoading,
    error,
    refetch,
    isFetching,
  };
};

// Hook para obtener analíticas del inventario (para el Dashboard)
export const useInventoryAnalytics = (timeRange: string) => {
  const queryKey = ['inventoryAnalytics', timeRange] as const; // 'as const' aquí también para consistencia

  const { data, isLoading, error, refetch } = useQuery<InventoryStats, Error, InventoryStats, typeof queryKey>({
    queryKey: queryKey,
    // ¡CORRECCIÓN AQUÍ! Llama a getInventoryAnalytics sin argumentos
    queryFn: () => InventoryService.getInventoryAnalytics(), 
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
