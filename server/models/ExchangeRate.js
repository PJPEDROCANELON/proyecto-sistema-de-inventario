// C:\Users\pedro\Desktop\project\server\models\ExchangeRate.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // Importa la instancia de Sequelize

const ExchangeRate = sequelize.define('ExchangeRate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Fecha de la tasa de cambio
  date: {
    type: DataTypes.DATEONLY, // Almacena solo la fecha (YYYY-MM-DD)
    allowNull: false,
    // unique: true, // Se hará único con un índice compuesto para permitir múltiples monedas por día
  },
  // Moneda de origen (ej. 'USD')
  fromCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USD', // Por defecto, la moneda base será USD
  },
  // Moneda de destino (ej. 'VEF' o 'Bs')
  toCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Bs', // Por defecto, la moneda de destino será Bs
  },
  // La tasa de cambio (ej. 36.5 para 1 USD = 36.5 Bs)
  rate: {
    type: DataTypes.DECIMAL(10, 4), // Permite hasta 4 decimales para mayor precisión
    allowNull: false,
    validate: {
      min: 0.0001, // La tasa debe ser un valor positivo
    },
  },
}, {
  timestamps: true, // Habilita createdAt y updatedAt
  tableName: 'exchange_rates', // Nombre de la tabla en la base de datos
  indexes: [
    {
      unique: true,
      fields: ['date', 'fromCurrency', 'toCurrency'], // Índice único para asegurar una tasa por día por par de monedas
      name: 'unique_exchange_rate_per_day' // Nombre opcional para el índice
    },
  ],
});

export default ExchangeRate;