// C:\Users\pedro\Desktop\project\server\config\database.js

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql'; // O 'postgres', 'sqlite', etc.

// Crear una instancia de Sequelize
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false, // Desactiva los logs SQL por defecto; cámbialo a true para depurar
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true, // Habilita createdAt y updatedAt por defecto
  }
});

// NUEVA FUNCIÓN: Para sincronizar la base de datos
// ATENCIÓN: { force: true } eliminará y recreará TODAS las tablas.
// Úsalo solo cuando no te importe perder los datos existentes.
// Después de la primera ejecución, cámbialo a { alter: true } para actualizaciones incrementales.
export const synchronizeDatabase = async () => {
  try {
    // IMPORTANTE PARA LA PRIMERA EJECUCIÓN (BORRA Y CREA TODO DESDE CERO)
    // Descomenta la siguiente línea para tu primera ejecución después de añadir los nuevos campos
    await sequelize.sync({ alter: true })
    console.log('✅ Database synchronized (all models processed - ALTERED).')
    
    // UNA VEZ QUE HAYAS EJECUTADO CON { force: true } CON ÉXITO Y HAYA CREADO LAS COLUMNAS:
    // Comenta la línea anterior 'force: true' y descomenta la siguiente para futuras actualizaciones incrementales
    // await sequelize.sync({ alter: true }); 
    // console.log('✅ Database synchronized (all models processed - ALTERED).');

  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error; // Propagar el error para que la aplicación no intente iniciar
  }
};
