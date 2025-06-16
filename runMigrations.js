import { Sequelize } from 'sequelize';
import config from './config/config.js';  // Asegúrate que la ruta es correcta
import dotenv from 'dotenv';

dotenv.config();

// Crear instancia de Sequelize directamente con los datos
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: config.development.host,
  username: config.development.username,
  password: config.development.password,
  database: config.development.database
});

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa!');
    
    await sequelize.sync();
    console.log('🚀 ¡Migraciones completadas con éxito!');
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

runMigrations();