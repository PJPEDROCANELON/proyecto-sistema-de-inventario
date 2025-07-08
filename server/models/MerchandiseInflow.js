// C:\Users\pedro\Desktop\project\server\models\MerchandiseInflow.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // Asegúrate de que sequelize se importe correctamente

// Definición del modelo MerchandiseInflow
// Esta tabla registrará cada instancia de entrada de mercadería (ej. una factura de proveedor)
const MerchandiseInflow = sequelize.define('MerchandiseInflow', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // El número de referencia debería ser único para cada entrada
    comment: 'Número de factura, guía de remisión o documento de referencia de la entrada de mercadería.',
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del proveedor de donde proviene la mercadería.',
  },
  inflowDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Por defecto, la fecha y hora actuales
    comment: 'Fecha y hora en que se registró la entrada de mercadería.',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre la entrada de mercadería (ej. estado del paquete, observaciones).',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // No necesitamos definir la referencia aquí, se hará en associations.js
    comment: 'ID del usuario que registró esta entrada de mercadería.',
  },
}, {
  // Opciones del modelo
  tableName: 'merchandise_inflows', // Nombre de la tabla en la base de datos
  timestamps: true, // Habilita createdAt y updatedAt
});

console.log('✅ Modelo MerchandiseInflow definido.');

export default MerchandiseInflow;
