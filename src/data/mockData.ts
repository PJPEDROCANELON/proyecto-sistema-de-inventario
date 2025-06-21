// C:\Users\pedro\Desktop\project\src\data\mockData.ts

import { Product, User, InventoryStats } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    nombre: 'Admin User',
    email: 'admin@example.com',
    rol: 'admin',
  },
  {
    id: 2,
    nombre: 'Empleado Uno',
    email: 'empleado1@example.com',
    rol: 'empleado',
  },
  {
    id: 3,
    nombre: 'Visualizador Invitado',
    email: 'viewer@example.com',
    rol: 'visualizador',
  },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Servilletas de Papel Grande',
    description: 'Servilletas de papel absorbentes para uso diario.',
    sku: 'SER-001',
    category: 'Limpieza',
    quantity: 200,
    minStock: 50,
    price: 5.99,
    status: 'In Stock',
    location: 'Aisle A, Shelf 1',
    supplier: 'PaperCo',
    lastUpdated: new Date('2023-01-15T10:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-01-01T08:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 2,
    name: 'Bolígrafos Azules (Caja de 12)',
    description: 'Bolígrafos de tinta azul de secado rápido.',
    sku: 'OFF-BOL-AZU-005',
    category: 'Oficina',
    quantity: 15,
    minStock: 20,
    price: 12.50,
    status: 'Low Stock',
    location: 'Aisle B, Bin 3',
    supplier: 'OfficeMate',
    lastUpdated: new Date('2023-06-01T14:30:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-05-20T11:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 3,
    name: 'Cartuchos de Tinta Negra (Compatible)',
    description: 'Cartuchos de tinta compatibles con impresoras HP.',
    sku: 'ELE-TIN-NEG-010',
    category: 'Electrónica',
    quantity: 0,
    minStock: 5,
    price: 25.00,
    status: 'Out of Stock',
    location: 'Warehouse, Zone C',
    supplier: 'InkRefill',
    lastUpdated: new Date('2023-07-10T09:15:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-25T16:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 4,
    name: 'Resaltadores Multicolor (Pack de 6)',
    description: 'Resaltadores de varios colores para oficina y estudio.',
    sku: 'OFF-RES-MUL-002',
    category: 'Oficina',
    quantity: 75,
    minStock: 30,
    price: 8.75,
    status: 'In Stock',
    location: 'Aisle B, Shelf 2',
    supplier: 'BrightMark',
    lastUpdated: new Date('2023-05-20T11:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-05-10T09:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 5,
    name: 'Cuadernos Espirales A4',
    description: 'Cuadernos con tapa dura y espiral, 100 hojas.',
    sku: 'OFF-CUA-ESP-001',
    category: 'Oficina',
    quantity: 25,
    minStock: 10,
    price: 4.20,
    status: 'In Stock',
    location: 'Aisle B, Shelf 1',
    supplier: 'Notebooks Inc.',
    lastUpdated: new Date('2023-07-05T13:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-15T10:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 6,
    name: 'Ratón Inalámbrico Ergonómico',
    description: 'Ratón para computadora con diseño ergonómico y conectividad inalámbrica.',
    sku: 'ELE-RAT-INA-003',
    category: 'Electrónica',
    quantity: 10,
    minStock: 5,
    price: 35.00,
    status: 'In Stock',
    location: 'Aisle C, Display 1',
    supplier: 'TechGear',
    lastUpdated: new Date('2023-07-01T17:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-20T14:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 7,
    name: 'Baterías AAA (Pack de 4)',
    description: 'Baterías alcalinas de larga duración.',
    sku: 'ELE-BAT-AAA-001',
    category: 'Electrónica',
    quantity: 100,
    minStock: 25,
    price: 6.50,
    status: 'In Stock',
    location: 'Aisle C, Shelf 3',
    supplier: 'PowerUp',
    lastUpdated: new Date('2023-06-28T09:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-10T10:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 8,
    name: 'Archivador Metálico',
    description: 'Archivador de 4 cajones para documentos de oficina.',
    sku: 'OFF-ARC-MET-001',
    category: 'Mobiliario',
    quantity: 2,
    minStock: 1,
    price: 150.00,
    status: 'In Stock',
    location: 'Showroom',
    supplier: 'SteelOffice',
    lastUpdated: new Date('2023-07-03T11:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-01T09:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 9,
    name: 'Limpiador Multiusos Concentrado (5L)',
    description: 'Limpiador para todo tipo de superficies, aroma cítrico.',
    sku: 'LIM-MUL-CON-001',
    category: 'Limpieza',
    quantity: 5,
    minStock: 2,
    price: 18.00,
    status: 'In Stock',
    location: 'Warehouse, Zone A',
    supplier: 'CleanAll',
    lastUpdated: new Date('2023-07-08T16:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-20T12:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
  {
    id: 10,
    name: 'Sillas de Oficina Ergonómicas',
    description: 'Sillas de oficina con soporte lumbar y ajuste de altura.',
    sku: 'MOB-SIL-ERG-002',
    category: 'Mobiliario',
    quantity: 8,
    minStock: 3,
    price: 99.00,
    status: 'In Stock',
    location: 'Showroom',
    supplier: 'ComfySeats',
    lastUpdated: new Date('2023-07-12T10:00:00Z'), // CONVERTED TO DATE OBJECT
    createdAt: new Date('2023-06-05T14:00:00Z'),   // CONVERTED TO DATE OBJECT
  },
];

export const mockInventoryStats: InventoryStats = {
  totalProducts: 10,
  totalItemsInStock: 500,
  totalValue: 15000.00,
  lowStockItems: 2, // Example
  outOfStockItems: 1, // Example
  inStockItems: 6, // Example
  overstockedItems: 1, // Example
  unknownStatusItems: 0, // Example
  categoriesDistribution: { 
    'Oficina': 4,
    'Limpieza': 2,
    'Electrónica': 3,
    'Mobiliario': 1,
  },
  topProductsByValue: [
    { id: 8, name: 'Archivador Metálico', sku: 'OFF-ARC-MET-001', category: 'Mobiliario', quantity: 2, price: 150.00, value: 300.00 },
    { id: 10, name: 'Sillas de Oficina Ergonómicas', sku: 'MOB-SIL-ERG-002', category: 'Mobiliario', quantity: 8, price: 99.00, value: 792.00 },
    { id: 3, name: 'Cartuchos de Tinta Negra (Compatible)', sku: 'ELE-TIN-NEG-010', category: 'Electrónica', quantity: 0, price: 25.00, value: 0.00 },
    { id: 2, name: 'Bolígrafos Azules (Caja de 12)', sku: 'OFF-BOL-AZU-005', category: 'Oficina', quantity: 15, price: 12.50, value: 187.50 },
    // CORRECCIÓN AQUÍ: Este objeto solo tendrá las propiedades de TopProductValue
    { id: 1, name: 'Servilletas de Papel Grande', sku: 'SER-001', category: 'Limpieza', quantity: 200, price: 5.99, value: 1198.00 }, 
  ],
  performanceMetrics: {
    fulfillmentRate: '95%',
    deliveryOnTime: '98%',
  },
  systemStatus: {
    databaseConnection: 'OK',
    serverUptime: 'OK',
  },
};
