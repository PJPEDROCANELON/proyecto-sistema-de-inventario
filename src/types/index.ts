export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Technology' | 'Supplies' | 'Components' | 'Materials';
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
  lastUpdated: string;
  supplier?: string;
  description?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: Record<string, number>;
}

export interface DashboardData {
  stats: InventoryStats;
  recentActivity: ActivityItem[];
  topProducts: Product[];
}

export interface ActivityItem {
  id: string;
  type: 'added' | 'updated' | 'removed' | 'restocked';
  productName: string;
  timestamp: string;
  details: string;
}