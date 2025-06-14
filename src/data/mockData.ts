import { Product, DashboardData, ActivityItem } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Quantum Processing Unit',
    sku: 'QPU-001',
    category: 'Technology',
    quantity: 45,
    minStock: 10,
    maxStock: 100,
    price: 2499.99,
    location: 'Sector Alpha-7',
    status: 'In Stock',
    lastUpdated: '2024-01-15T14:30:00Z',
    supplier: 'NeoTech Industries',
    description: 'Advanced quantum processing unit for next-gen computing systems'
  },
  {
    id: '2',
    name: 'Holographic Display Matrix',
    sku: 'HDM-203',
    category: 'Technology',
    quantity: 8,
    minStock: 15,
    maxStock: 50,
    price: 1899.99,
    location: 'Sector Beta-3',
    status: 'Low Stock',
    lastUpdated: '2024-01-14T09:15:00Z',
    supplier: 'CyberVision Corp',
    description: '4K holographic display with neural interface compatibility'
  },
  {
    id: '3',
    name: 'Neural Interface Cables',
    sku: 'NIC-505',
    category: 'Components',
    quantity: 0,
    minStock: 25,
    maxStock: 200,
    price: 89.99,
    location: 'Sector Gamma-1',
    status: 'Out of Stock',
    lastUpdated: '2024-01-13T16:45:00Z',
    supplier: 'BioLink Solutions',
    description: 'High-bandwidth neural interface cables for cybernetic implants'
  },
  {
    id: '4',
    name: 'Plasma Energy Cells',
    sku: 'PEC-401',
    category: 'Components',
    quantity: 150,
    minStock: 30,
    maxStock: 100,
    price: 299.99,
    location: 'Sector Delta-9',
    status: 'Overstocked',
    lastUpdated: '2024-01-15T11:20:00Z',
    supplier: 'Fusion Dynamics',
    description: 'High-capacity plasma energy cells for industrial applications'
  },
  {
    id: '5',
    name: 'Nano-Fabrication Tools',
    sku: 'NFT-102',
    category: 'Supplies',
    quantity: 23,
    minStock: 20,
    maxStock: 80,
    price: 1299.99,
    location: 'Sector Epsilon-5',
    status: 'In Stock',
    lastUpdated: '2024-01-14T13:10:00Z',
    supplier: 'MicroTech Labs',
    description: 'Precision nano-fabrication tools for molecular assembly'
  },
  {
    id: '6',
    name: 'Synthetic Polymer Sheets',
    sku: 'SPS-308',
    category: 'Materials',
    quantity: 5,
    minStock: 12,
    maxStock: 60,
    price: 159.99,
    location: 'Sector Zeta-2',
    status: 'Low Stock',
    lastUpdated: '2024-01-15T10:05:00Z',
    supplier: 'BioMaterials Inc',
    description: 'Advanced synthetic polymer sheets for construction applications'
  }
];

export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'updated',
    productName: 'Quantum Processing Unit',
    timestamp: '2024-01-15T14:30:00Z',
    details: 'Stock updated: +15 units received'
  },
  {
    id: '2',
    type: 'added',
    productName: 'Holographic Display Matrix',
    timestamp: '2024-01-14T09:15:00Z',
    details: 'New product added to inventory'
  },
  {
    id: '3',
    type: 'removed',
    productName: 'Neural Interface Cables',
    timestamp: '2024-01-13T16:45:00Z',
    details: 'Last 25 units shipped to Sector X'
  },
  {
    id: '4',
    type: 'restocked',
    productName: 'Plasma Energy Cells',
    timestamp: '2024-01-15T11:20:00Z',
    details: 'Emergency restock: +50 units'
  }
];

export const getMockDashboardData = (): DashboardData => {
  const stats = {
    totalProducts: mockProducts.length,
    totalValue: mockProducts.reduce((sum, product) => sum + (product.quantity * product.price), 0),
    lowStockItems: mockProducts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length,
    outOfStockItems: mockProducts.filter(p => p.status === 'Out of Stock').length,
    categories: mockProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    stats,
    recentActivity: mockActivities,
    topProducts: mockProducts.slice(0, 3)
  };
};