// C:\Users\pedro\Desktop\project\server\routes\merchandiseInflowRoutes.js

import express from 'express';
// Importa las funciones del controlador de entrada de mercadería
import { 
  createMerchandiseInflow, 
  getMerchandiseInflows, 
  getMerchandiseInflowById 
} from '../controllers/merchandiseInflowController.js';
import authenticateToken from '../middlewares/authMiddleware.js'; // Importar el middleware de autenticación

const router = express.Router();

// Aplica el middleware authenticateToken a todas las rutas de entradas de mercadería.
// Esto significa que cualquier solicitud a /api/merchandise-inflow/* requerirá un JWT válido.
router.use(authenticateToken); 

// Rutas para la gestión de entradas de mercadería
router.post('/', createMerchandiseInflow); // Registrar una nueva entrada de mercadería
router.get('/', getMerchandiseInflows);   // Obtener todas las entradas de mercadería (con paginación/filtros)
router.get('/:id', getMerchandiseInflowById); // Obtener una entrada de mercadería específica por ID

// Las rutas para PUT/DELETE (actualizar/eliminar) se dejarán para más adelante si es necesario,
// ya que afectan el stock y requieren una lógica de reversión cuidadosa.

export default router;
