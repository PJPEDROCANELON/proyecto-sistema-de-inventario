// C:\Users\pedro\Desktop\project\server\models\User.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // NUEVOS CAMPOS PARA LAS PREFERENCIAS DE AJUSTES
  lowStockAlertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Valor por defecto
    allowNull: false,
  },
  outOfStockAlertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Valor por defecto
    allowNull: false,
  },
  notificationFrequency: {
    type: DataTypes.ENUM('inmediate', 'daily', 'weekly'),
    defaultValue: 'daily', // Valor por defecto
    allowNull: false,
  },
  defaultMinStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10, // Valor por defecto
    allowNull: false,
  },
  defaultOverstockMultiplier: {
    type: DataTypes.FLOAT, // Usamos FLOAT para permitir valores como 2.0, 1.5, etc.
    defaultValue: 2.0, // Valor por defecto (ej. sobrestock si > 2x minStock)
    allowNull: false,
  },
  defaultQuantityUnit: {
    type: DataTypes.STRING,
    defaultValue: 'unidades', // Valor por defecto
    allowNull: false,
  },
  defaultCurrencySymbol: {
    type: DataTypes.STRING,
    defaultValue: '$', // Valor por defecto
    allowNull: false,
  },
  defaultDateFormat: {
    type: DataTypes.STRING,
    defaultValue: 'dd/MM/yyyy', // Valor por defecto (ej. 25/06/2025)
    allowNull: false,
  },
  defaultTimeFormat: {
    type: DataTypes.STRING,
    defaultValue: 'HH:mm', // Valor por defecto (ej. 14:30)
    allowNull: false,
  },
  themePreference: {
    type: DataTypes.ENUM('light', 'dark', 'system'),
    defaultValue: 'system', // Valor por defecto: el tema del sistema operativo
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

// ¡IMPORTANTE! Las asociaciones se definirán en un archivo separado (associations.js)

export default User;
