// C:\Users\pedro\Desktop\project\src\types\index.ts

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado' | 'visualizador'; 
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked' | 'Unknown';

// Tipo para la prioridad de las alertas
export type AlertPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  category?: string;
  quantity: number;
  minStock?: number;
  price: number;
  status?: ProductStatus; 
  location?: string;
  supplier?: string;
  imageUrl?: string;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Pagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pagination: Pagination;
}

export interface InventoryQueryOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
}

export interface NeoStockResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  quantumTimestamp: number;
  version: string;
}

export interface TopProductValue {
  id: number;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  price: number;
  value: number;
}

export interface PerformanceMetrics {
  fulfillmentRate: string; 
  deliveryOnTime: string;
}

export interface SystemStatus {
  databaseConnection: string;
  serverUptime: string;
}

export interface InventoryStats {
  totalProducts: number; 
  totalItemsInStock: number; 
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inStockItems: number; 
  overstockedItems: number; 
  unknownStatusItems: number; 
  categoriesDistribution: { [key: string]: number };
  topProductsByValue: TopProductValue[];
  performanceMetrics: PerformanceMetrics;
  systemStatus: SystemStatus;
}

// NUEVA INTERFAZ PARA LAS ALERTAS
export interface InventoryAlert {
  id: number;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  minStock?: number;
  location?: string;
  status: ProductStatus;   // Estado calculado que generó la alerta
  priority: AlertPriority; // Prioridad de la alerta
  lastUpdated: Date;       // Fecha de la última actualización del producto
  isRead: boolean;         // Para marcar si la alerta ha sido leída
}
