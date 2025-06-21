// C:\Users\pedro\Desktop\project\server\models\associations.js

// Importa los modelos después de que hayan sido definidos
import User from './User.js';
import Product from './Product.js';

const defineAssociations = () => {
  // Un usuario tiene muchos productos
  User.hasMany(Product, { foreignKey: 'userId', as: 'products' });

  // Un producto pertenece a un usuario
  Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  console.log('✅ Asociaciones de Sequelize definidas.');
};

export default defineAssociations;
