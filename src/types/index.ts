// C:\Users\pedro\Desktop\project\src\types\index.ts

// --- Tipos Generales de Respuesta de API ---
export interface NeoStockResponse<T> {
  success: boolean;
  message?: string;
  data?: T | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// NUEVA INTERFAZ: Para errores específicos del backend que no son 404/500 genéricos
export interface BackendErrorResponse {
  success: boolean;
  message?: string;
  errors?: { msg: string; param?: string; location?: string }[]; 
  error?: string; 
  quantumTimestamp?: number;
  version?: string;
}

// NUEVA INTERFAZ: Para Tasas de Cambio
export interface ExchangeRate {
  id: number;
  date: string; // Formato YYYY-MM-DD
  fromCurrency: string; // Ej: 'USD'
  toCurrency: string;   // Ej: 'Bs'
  rate: number;         // La tasa de cambio
  createdAt?: string;
  updatedAt?: string;
}


// --- Tipos de Autenticación ---
export interface LoginPayload {
  username?: string; 
  email?: string;
  password: string;
}

export interface RegisterPayload {
  username: string; 
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User; // El objeto user que se devuelve (ahora directamente de tipo User extendido)
}

// INTERFAZ USER ACTUALIZADA CON LOS NUEVOS CAMPOS DE PREFERENCIAS
export interface User {
  id: number;
  username: string; 
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
  // NUEVOS CAMPOS DE PREFERENCIAS DE AJUSTES
  lowStockAlertEnabled: boolean;
  outOfStockAlertEnabled: boolean;
  notificationFrequency: 'inmediate' | 'daily' | 'weekly';
  defaultMinStockThreshold: number;
  defaultOverstockMultiplier: number;
  defaultQuantityUnit: string;
  defaultCurrencySymbol: string;
  defaultDateFormat: string;
  defaultTimeFormat: string;
  themePreference: 'light' | 'dark' | 'system';
}

// --- Tipos de Productos ---
export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked' | 'Unknown';

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  category: string;
  quantity: number;
  minStock?: number;
  price: number;
  status: ProductStatus;
  location?: string;
  lastUpdated: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryQueryOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: ProductStatus | 'all';
}

// --- Tipos de Órdenes ---
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Canceled';
export type DeliveryStatus = 'On Time' | 'Delayed' | 'In Transit' | 'Not Applicable' | 'Unknown';

export interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  deliveryDateExpected: string | null;
  deliveryDateActual: string | null;
  deliveryStatus: DeliveryStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  orderItems?: OrderItem[]; // Propiedad corregida a 'orderItems' (minúscula)
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  priceAtSale: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// NUEVA INTERFACE: TopProductValue
export interface TopProductValue {
  id: number;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  price: number;
  value: number;
}

// --- Tipos de Estadísticas/Analíticas de Inventario ---
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
  performanceMetrics: {
    fulfillmentRate: string;
    deliveryOnTime: string;
  };
  systemStatus: {
    databaseConnection: string;
    serverUptime: string;
  };
}

// --- Tipos de Alertas de Inventario ---
export type AlertPriority = 'Low' | 'Medium' | 'High' | 'Critical'; 

export interface InventoryAlert {
  id: number;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  minStock?: number;
  location?: string;
  status: ProductStatus;
  priority: AlertPriority; 
  lastUpdated: string;
  isRead: boolean;
  description?: string; 
}


// --- NUEVOS TIPOS: Entradas de Mercadería (Merchandise Inflow) ---

export interface MerchandiseInflowItem {
  id?: number; // Puede ser opcional al crear uno nuevo
  merchandiseInflowId?: number; // Se asignará en el backend
  productId: number;
  productName?: string; // Para mostrar en el frontend, no necesariamente se guarda en BD para InflowItem
  sku?: string; // Para mostrar en el frontend
  quantityReceived: number;
  unitCost?: number;
  lotNumber?: string;
  expirationDate?: string; // Formato string ISO (YYYY-MM-DD)
  createdAt?: string;
  updatedAt?: string;
  // CAMBIO CLAVE: Cambiado de 'product?: Product;' a 'inflowProduct?: Product;'
  inflowProduct?: Product; // El producto real asociado (se usaría con el alias 'inflowProduct' del backend)
}

export interface MerchandiseInflow {
  id?: number; // Puede ser opcional al crear uno nuevo
  userId?: number; // Se asignará en el backend
  referenceNumber: string;
  supplier: string;
  inflowDate: string; // Formato string ISO (YYYY-MM-DD)
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  inflowItems?: MerchandiseInflowItem[]; // Los ítems de la entrada
  // Si incluyes el usuario que registró la entrada:
  registeredBy?: { // Basado en el alias 'registeredBy' en el backend
    username: string; // Corregido a username
    email: string;
  };
}

// Interfaz para las opciones de consulta de entradas de mercadería
export interface MerchandiseInflowQueryOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  supplier?: string;
  startDate?: string; // Formato 'YYYY-MM-DD'
  endDate?: string; // Formato 'YYYY-MM-DD'
}