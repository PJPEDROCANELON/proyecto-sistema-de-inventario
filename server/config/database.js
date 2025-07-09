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

// Función para sincronizar la base de datos
export const synchronizeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established');

    // Deshabilitar temporalmente la verificación de claves foráneas
    // Esto permite que Sequelize cree tablas con dependencias de claves foráneas
    // sin preocuparse por el orden inicial de creación.
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    console.log('ℹ️ Verificación de claves foráneas deshabilitada temporalmente.');

    // Sincronizar todos los modelos
    // { alter: true } intenta realizar cambios incrementales en la base de datos
    // sin eliminar datos existentes.
    // Si necesitas recrear todas las tablas desde cero (y perder todos los datos),
    // usa { force: true } en su lugar, pero ¡úSALO CON CAUTELA!
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada correctamente (modelos procesados - ALTERED).');

    // Re-habilitar la verificación de claves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    console.log('ℹ️ Verificación de claves foráneas re-habilitada.');

  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    throw error; // Propagar el error para que la aplicación no intente iniciar
  }
};
