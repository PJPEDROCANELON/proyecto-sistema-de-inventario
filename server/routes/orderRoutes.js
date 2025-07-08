// C:\Users\pedro\Desktop\project\server\routes\orderRoutes.js

import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  // IMPORTANTE: Asegúrate de que updateOrderStatus esté exportado en orderController.js
  updateOrderStatus, // Nuevo: Importa la función para actualizar el estado
} from '../controllers/orderController.js'; // Asumimos que updateOrderStatus está aquí
import authenticateToken from '../middlewares/authMiddleware.js'; // Importar el middleware de autenticación

const router = express.Router();

// Aplica el middleware authenticateToken a todas las rutas de órdenes.
// Esto significa que cualquier solicitud a /api/orders/* requerirá un JWT válido.
router.use(authenticateToken); 

// Rutas para la gestión de órdenes
router.post('/', createOrder);      // Crear una nueva orden
router.get('/', getOrders);         // Obtener todas las órdenes del usuario autenticado (con paginación/filtros)
router.get('/:id', getOrderById);   // Obtener una orden específica por ID para el usuario autenticado
router.put('/:id', updateOrder);    // Actualizar una orden existente para el usuario autenticado
router.delete('/:id', deleteOrder); // Eliminar una orden existente (y restaurar stock) para el usuario autenticado

// NUEVA RUTA: Actualizar solo el estado de una orden
// La URL de tu frontend PUT /api/orders/{id}/status coincide con esta
router.put('/:id/status', updateOrderStatus); // Maneja la actualización específica del estado

export default router;
