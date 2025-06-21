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

// ¡Importante!: La conexión se autentica en index.js, no aquí directamente.
// Este archivo solo define y exporta la instancia de sequelize.
