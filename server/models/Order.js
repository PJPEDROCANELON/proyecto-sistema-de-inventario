// C:\Users\pedro\Desktop\project\server\models\Order.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // <-- CAMBIO AQUÍ: Ahora importa con desestructuración
import User from './User.js'; 

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'Pending',    
      'Processing', 
      'Shipped',    
      'Completed',  
      'Canceled'    
    ),
    allowNull: false,
    defaultValue: 'Pending', 
  },
  deliveryDateExpected: {
    type: DataTypes.DATEONLY, 
    allowNull: true,
  },
  deliveryDateActual: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveryStatus: {
    type: DataTypes.ENUM(
      'On Time',
      'Delayed',
      'In Transit', 
      'Not Applicable' 
    ),
    allowNull: false,
    defaultValue: 'In Transit', 
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true, 
});

Order.belongsTo(User, { foreignKey: 'userId' });

export default Order;
