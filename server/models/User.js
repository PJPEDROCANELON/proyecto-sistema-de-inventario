// C:\Users\pedro\Desktop\project\server\models\User.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js'; // <-- Importa sequelize

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
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
}, {
  timestamps: true,
  tableName: 'users',
});

// ¡IMPORTANTE! Las asociaciones se definirán en un archivo separado (associations.js)

export default User;
