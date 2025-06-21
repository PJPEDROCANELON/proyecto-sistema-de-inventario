// C:\Users\pedro\Desktop\project\server\routes\inventoryRoutes.js

import express from 'express';
import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getInventoryAnalytics, 
  getInventoryAlerts 
} from '../controllers/inventoryController.js';
import authenticateToken from '../middlewares/authMiddleware.js'; // <-- RUTA CORREGIDA: ¡ahora con 's' en 'middlewares'!

const router = express.Router();

// Aplica el middleware authenticateToken a todas las rutas de inventario.
// Esto significa que cualquier request a /api/inventory/* requerirá un JWT válido.
router.use(authenticateToken); 

// Rutas para los productos (GET, POST, PUT, DELETE)
// Nota: '/products' aquí es relativo a '/api/inventory' que se define en index.js
router.get('/products', getProducts); // Obtener todos los productos del usuario autenticado
router.get('/products/:id', getProductById); // Obtener un producto específico del usuario autenticado
router.post('/products', addProduct); // Usar 'addProduct'
router.put('/products/:id', updateProduct); // Actualizar un producto existente del usuario autenticado
router.delete('/products/:id', deleteProduct); // Eliminar un producto existente del usuario autenticado

// Rutas para analíticas y alertas (también protegidas por el middleware)
router.get('/analytics', getInventoryAnalytics); // Rutas para obtener analíticas del usuario autenticado
router.get('/alerts', getInventoryAlerts);     // Rutas para obtener alertas del usuario autenticado


export default router;
