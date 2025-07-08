// C:\Users\pedro\Desktop\project\server\routes\alertsRoutes.js
import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js'; 
// CORRECCIÓN CLAVE: Cambiado de '../middlewares/auth.js' a '../middlewares/authMiddleware.js'
import authMiddleware from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', authMiddleware, inventoryController.getInventoryAlerts);

export default router;
