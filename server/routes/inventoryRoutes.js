// C:\Users\pedro\Desktop\project\server\routes\inventoryRoutes.js

import express from 'express';
import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getInventoryAnalytics, 
  getInventoryAlerts,
  recordSale,         // Para registrar una venta (crea una orden)
  getOrders,          // Para obtener órdenes (listado paginado)
  getOrderById,       // Para obtener una orden por su ID
  updateOrderStatus   // NUEVO: Para actualizar el estado de una orden
} from '../controllers/inventoryController.js';
import authenticateToken from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// Aplica el middleware authenticateToken a todas las rutas de inventario, incluyendo las nuevas de órdenes.
router.use(authenticateToken); 

// --- Rutas de Productos ---
router.get('/products', getProducts); 
router.get('/products/:id', getProductById); 
router.post('/products', addProduct); 
router.put('/products/:id', updateProduct); 
router.delete('/products/:id', deleteProduct); 

// --- Rutas de Venta / Órdenes ---
// Ruta para registrar una venta (que automáticamente crea una orden y deduce stock)
// Mantenemos /products/sale como lo tenías, pero el controller lo trata como una creación de orden
router.post('/products/sale', recordSale); 

// Rutas para obtener y gestionar Órdenes
router.get('/orders', getOrders);           // Obtener listado de órdenes (con paginación/filtros)
router.get('/orders/:id', getOrderById);    // Obtener una orden específica por ID
// NUEVA RUTA: Para actualizar el estado de una orden (ej: /api/orders/123/status)
router.put('/orders/:id/status', updateOrderStatus); 

// --- Rutas para Analíticas y Alertas ---
router.get('/analytics', getInventoryAnalytics); 
router.get('/alerts', getInventoryAlerts);     

export default router;
