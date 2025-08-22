// C:\Users\pedro\Desktop\project\server\index.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize, synchronizeDatabase } from './config/database.js';

// Importaciones de los modelos (necesarias para que Sequelize los cargue)
import './models/User.js';
import './models/Product.js';
import './models/Order.js';
import './models/OrderItem.js';
import './models/MerchandiseInflow.js';
import './models/MerchandiseInflowItem.js';
import './models/ExchangeRate.js'; // NUEVO: Importar el modelo de Tasa de Cambio

// Importa la función que define las asociaciones
import defineAssociations from './models/associations.js';

// Rutas
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import merchandiseInflowRoutes from './routes/merchandiseInflowRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js'; // NUEVO: Importar las rutas de Tasa de Cambio

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares Globales ---
app.use(cors({
  origin: process.env.FRONTEND_URL, // CAMBIO CLAVE AQUÍ: Usar variable de entorno
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'NeoStock-Version',
    'X-Quantum-Client',
    'X-Quantum-Timestamp'
  ],
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[GLOBAL REQUEST LOGGER] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  console.log(`[APP REQUEST] ${req.method} ${req.url}`);
  next();
});

// --- Rutas de la Aplicación ---
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/merchandise-inflow', merchandiseInflowRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes); // NUEVO: Usar las rutas de Tasa de Cambio

// Ruta de estado del backend (health check) - CORREGIDA A /api/status
app.get('/api/status', (req, res) => {
  console.log('[HEALTH CHECK] GET /api/status - Backend health check requested');
  res.status(200).json({
    message: 'Backend is running smoothly!',
    timestamp: new Date(),
  });
});

// --- Manejo de Errores ---
app.use((req, res, next) => {
  console.warn(`[404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Ruta no encontrada.', error: `No route for ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('❌ [ERROR GLOBAL] Error interno del servidor:', err);
  const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor.';
  const errorStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  res.status(err.status || 500).json({
    success: false,
    message: errorMessage,
    error: errorStack,
  });
});

// --- Manejo de Excepciones No Capturadas ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 [UNHANDLED REJECTION] Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('🔴 [UNCAUGHT EXCEPTION] Excepción no capturada:', err, 'Origen:', origin);
  process.exit(1);
});

// --- Inicio del Servidor ---
app.listen(PORT, async () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
  try {
    // Definir asociaciones ANTES de sincronizar para que las tablas se creen con las relaciones
    defineAssociations();
    await synchronizeDatabase();
    console.log('🎉 Server fully initialized and database ready to serve requests.');
  } catch (dbError) {
    console.error('FATAL: La inicialización de la base de datos falló al iniciar el servidor:', dbError);
    process.exit(1);
  }
});
