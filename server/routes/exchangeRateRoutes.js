// C:\Users\pedro\Desktop\project\server\routes\exchangeRateRoutes.js

import express from 'express';
import { addExchangeRate, getLatestExchangeRate } from '../controllers/exchangeRateController.js';
// Importa verifyToken si tienes un middleware de autenticación y quieres proteger estas rutas
// import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Ruta para añadir una nueva tasa de cambio
// Podrías querer proteger esta ruta con verifyToken si solo los administradores pueden añadir tasas
router.post('/', addExchangeRate); 

// Ruta para obtener la tasa de cambio más reciente
// Esta ruta probablemente no necesite autenticación, ya que es para lectura de datos públicos (tasas)
router.get('/latest', getLatestExchangeRate);

export default router;