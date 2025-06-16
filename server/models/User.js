import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Sincronizar el modelo con la base de datos
(async () => {
  try {
    await User.sync();
    console.log('✅ Modelo de Usuario sincronizado con la base de datos');
  } catch (error) {
    console.error('❌ Error al sincronizar modelo de Usuario:', error);
  }
})();

export default User;