// C:\Users\pedro\Desktop\project\server\models\OrderItem.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // Importa la instancia de Sequelize
import Order from './Order.js';    // Importa el modelo Order
import Product from './Product.js'; // Importa el modelo Product

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: { // Clave foránea para la orden a la que pertenece este ítem
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order, // CAMBIO CLAVE AQUÍ: Ahora referencia al OBJETO MODELO Order
      key: 'id',
    },
    onDelete: 'CASCADE', // Si se elimina una orden, sus ítems también se eliminan
  },
  productId: { // Clave foránea para el producto del inventario
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product, // CAMBIO CLAVE AQUÍ: Ahora referencia al OBJETO MODELO Product
      key: 'id',
    },
    onDelete: 'RESTRICT', // No permitir eliminar un producto si está en órdenes existentes
  },
  productName: { // Nombre del producto al momento de la venta (para registro histórico)
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: { // SKU del producto al momento de la venta (para registro histórico)
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: { // Cantidad de este producto en esta línea de la orden
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1, // La cantidad mínima en una orden debe ser 1
    },
  },
  priceAtSale: { // Precio unitario del producto al momento exacto de la venta
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  category: { // Categoría del producto al momento de la venta (para registro histórico/analíticas)
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true, // Habilita createdAt y updatedAt
  tableName: 'order_items', // Nombre de la tabla en la base de datos
});

// Definir asociaciones:
// Un OrderItem pertenece a una Order
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Un OrderItem pertenece a un Product
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export default OrderItem;
