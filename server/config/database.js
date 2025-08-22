// C:\Users\pedro\Desktop\project\server\config\database.js

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

let sequelize;
let isPostgres = false;

// Determinar si usar la URL de Render (PostgreSQL) o las variables locales (MySQL)
if (process.env.DATABASE_URL) {
  // Entorno de producción (Render)
  console.log('Detected DATABASE_URL variable. Connecting to PostgreSQL...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  });
  isPostgres = true;
} else {
  // Entorno de desarrollo local (MySQL)
  console.log('No DATABASE_URL found. Connecting to MySQL locally...');
  const DB_NAME = process.env.DB_NAME;
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD;
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_DIALECT = 'mysql';

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
    }
  });
}

// Función para sincronizar la base de datos
export const synchronizeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connection established with ${isPostgres ? 'PostgreSQL' : 'MySQL'}`);

    // Solo para MySQL: Deshabilitar la verificación de claves foráneas temporalmente
    if (!isPostgres) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
      console.log('ℹ️ Foreign key checks temporarily disabled.');
    }

    // Sincronizar todos los modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully (models processed - ALTERED).');

    // Solo para MySQL: Re-habilitar la verificación de claves foráneas
    if (!isPostgres) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
      console.log('ℹ️ Foreign key checks re-enabled.');
    }

  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

export { sequelize };
