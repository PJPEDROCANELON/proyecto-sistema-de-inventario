import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Obtener valores de .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'inventario_db';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: console.log // Para ver las consultas SQL en consola
});

async function checkTables() {
  try {
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa!');

    // 2. Listar tablas
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('📋 Tablas en la base de datos:');
    console.table(tables);

    // 3. Si no hay tablas, crearlas manualmente
    if (tables.length === 0) {
      console.log('ℹ️ No se encontraron tablas. Creando manualmente...');
      
      // Crear tabla Usuarios
      await sequelize.query(`
        CREATE TABLE Usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      
      // Crear tabla Productos
      await sequelize.query(`
        CREATE TABLE Productos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          cantidad INT DEFAULT 0,
          precio DECIMAL(10,2),
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      
      console.log('🚀 Tablas creadas exitosamente!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

checkTables();