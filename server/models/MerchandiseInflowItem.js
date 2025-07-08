// C:\Users\pedro\Desktop\project\server\models\MerchandiseInflowItem.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // Asegúrate de que sequelize se importe correctamente

// Definición del modelo MerchandiseInflowItem
// Esta tabla registrará cada producto individual recibido en una entrada de mercadería
const MerchandiseInflowItem = sequelize.define('MerchandiseInflowItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  merchandiseInflowId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // La referencia al modelo MerchandiseInflow se definirá en associations.js
    comment: 'ID de la entrada de mercadería a la que pertenece este ítem.',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // La referencia al modelo Product se definirá en associations.js
    comment: 'ID del producto específico que se recibió.',
  },
  quantityReceived: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1, // La cantidad recibida debe ser al menos 1
    },
    comment: 'Cantidad de este producto que se recibió en esta entrada.',
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2), // Ejemplo: 10 dígitos en total, 2 después del decimal
    allowNull: true, // Opcional: el costo unitario puede no ser siempre registrado
    comment: 'Costo unitario del producto en el momento de esta recepción.',
  },
  lotNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Opcional
    comment: 'Número de lote o serie si aplica para la trazabilidad.',
  },
  expirationDate: {
    type: DataTypes.DATEONLY, // Solo la fecha, sin hora, para vencimiento
    allowNull: true, // Opcional
    comment: 'Fecha de vencimiento del producto, si aplica.',
  },
}, {
  // Opciones del modelo
  tableName: 'merchandise_inflow_items', // Nombre de la tabla en la base de datos
  timestamps: true, // Habilita createdAt y updatedAt
});

console.log('✅ Modelo MerchandiseInflowItem definido.');

export default MerchandiseInflowItem;
