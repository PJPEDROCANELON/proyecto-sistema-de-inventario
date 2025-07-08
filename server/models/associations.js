// C:\Users\pedro\Desktop\project\server\models\associations.js

// Importa los modelos después de que hayan sido definidos
import User from './User.js';
import Product from './Product.js';
import Order from './Order.js'; 
import OrderItem from './OrderItem.js'; 
// NUEVOS: Importar modelos de Entrada de Mercadería
import MerchandiseInflow from './MerchandiseInflow.js';
import MerchandiseInflowItem from './MerchandiseInflowItem.js';

const defineAssociations = () => {
  // --- Asociaciones User <-> Product ---
  // Un usuario tiene muchos productos
  User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
  // Un producto pertenece a un usuario (el propietario/dueño)
  Product.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

  // --- Asociaciones para Órdenes y sus ÍtemS ---

  // 1. User <-> Order (Un usuario puede tener muchas órdenes)
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  // Una orden pertenece a un usuario (el cliente que la hizo)
  Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

  // 2. Order <-> OrderItem (Una orden puede tener muchos ítems de orden)
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
  // Un OrderItem pertenece a una Order
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'orderItemOrder' }); 

  // 3. Product <-> OrderItem (Un producto puede estar en muchos ítems de orden)
  Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'productOrderItems' }); 
  // Un OrderItem pertenece a un Product
  // CAMBIO CRÍTICO Y DEFINITIVO AQUÍ: Alias cambiado a 'relatedProduct'
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'relatedProduct' }); 

  // --- NUEVAS ASOCIACIONES PARA ENTRADA DE MERCADERÍA Y SUS ÍTEMS ---

  // 1. User <-> MerchandiseInflow (Un usuario puede registrar muchas entradas de mercadería)
  User.hasMany(MerchandiseInflow, { foreignKey: 'userId', as: 'merchandiseInflows' });
  // Una entrada de mercadería pertenece a un usuario (el que la registró)
  MerchandiseInflow.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

  // 2. MerchandiseInflow <-> MerchandiseInflowItem (Una entrada tiene muchos ítems de entrada)
  MerchandiseInflow.hasMany(MerchandiseInflowItem, { foreignKey: 'merchandiseInflowId', as: 'inflowItems' });
  // Un MerchandiseInflowItem pertenece a una MerchandiseInflow
  MerchandiseInflowItem.belongsTo(MerchandiseInflow, { foreignKey: 'merchandiseInflowId', as: 'inflow' });

  // 3. Product <-> MerchandiseInflowItem (Un producto puede estar en muchos ítems de entrada de mercadería)
  Product.hasMany(MerchandiseInflowItem, { foreignKey: 'productId', as: 'merchandiseInflowItems' });
  // Un MerchandiseInflowItem pertenece a un Product
  MerchandiseInflowItem.belongsTo(Product, { foreignKey: 'productId', as: 'inflowProduct' }); 

  console.log('✅ Asociaciones de Sequelize definidas (todos los aliases son únicos y explícitos).');
};

export default defineAssociations;
