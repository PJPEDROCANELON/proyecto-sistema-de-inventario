// C:\Users\pedro\Desktop\project\server\models\Product.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // <-- Importa sequelize

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true, // Se mantiene desactivado si permites el mismo SKU para diferentes usuarios
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('In Stock', 'Low Stock', 'Out of Stock', 'Overstocked', 'Unknown'),
    allowNull: true,
    defaultValue: 'Unknown',
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Nombre de la tabla a la que se hace referencia (debe coincidir con tableName de User)
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  timestamps: true,
  tableName: 'products',
});

// ¡IMPORTANTE! Las asociaciones se definirán en un archivo separado (associations.js)

export default Product;
