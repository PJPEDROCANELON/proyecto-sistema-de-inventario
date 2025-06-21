// C:\Users\pedro\Desktop\project\server\index.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './config/database.js';

// Importaciones de los modelos (necesarias para que Sequelize los cargue)
import './models/User.js'; 
import './models/Product.js'; 

// Importa la función que define las asociaciones
import defineAssociations from './models/associations.js'; 

import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares Globales ---
app.use(cors({
  origin: 'http://localhost:5173', // Asegúrate de que esta sea la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // ¡CAMBIO CLAVE AQUÍ! Añadimos tus encabezados personalizados
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'NeoStock-Version', 
    'X-Quantum-Client', 
    'X-Quantum-Timestamp' // Este también se genera dinámicamente
  ], 
}));
app.use(express.json()); // Para parsear cuerpos de solicitud JSON

// NUEVO: Middleware para loguear CUALQUIER petición que llegue al servidor Express
app.use((req, res, next) => {
  console.log(`[GLOBAL REQUEST LOGGER] ${req.method} ${req.url}`);
  next();
});

// Middleware para loguear cada solicitud entrante (más específico para la app)
app.use((req, res, next) => {
  console.log(`[APP REQUEST] ${req.method} ${req.url}`);
  next();
});

// --- Rutas de la Aplicación ---
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes); 

// Ruta de estado del backend (health check)
// Esta ruta no debe estar protegida por authMiddleware
app.get('/status', (req, res) => {
  console.log('[HEALTH CHECK] GET /status - Backend health check requested');
  res.status(200).json({ 
    message: 'Backend is running smoothly!', 
    timestamp: new Date(),
  });
});

// --- Manejo de Errores ---
// Este middleware de 404 debe ir DESPUÉS de todas las rutas
app.use((req, res, next) => {
  console.warn(`[404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Ruta no encontrada.', error: `No route for ${req.method} ${req.originalUrl}` });
});

// Este es el manejador de errores general, debe ir al final
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

// --- Sincronización de Base de Datos ---
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established');

    // Definir asociaciones DESPUÉS de que la conexión esté establecida y los modelos importados
    defineAssociations(); 

    // Sincronizar todos los modelos definidos con la base de datos
    // Recuerda que force: true BORRA los datos. Si ya no quieres borrar, cambia a { alter: true }
    await sequelize.sync({ alter: true }); // Mantenemos alter:true si ya te funcionó.
    console.log('✅ Database synchronized (all models processed).');
  } catch (error) {
    console.error('❌ [DATABASE ERROR] No se pudo conectar a la base de datos o sincronizar modelos:', error);
    process.exit(1); 
  }
};

// --- Manejo de Excepciones No Capturadas (para debugging) ---
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
    await syncDatabase();
    console.log('🎉 Server fully initialized and database ready to serve requests.'); 
  } catch (dbError) {
    console.error('FATAL: La sincronización de la base de datos falló DESPUÉS de que el servidor comenzó a escuchar:', dbError);
    process.exit(1); 
  }
});
