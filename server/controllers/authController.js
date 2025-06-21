// C:\Users\pedro\Desktop\project\server\controllers\authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Función de utilidad para generar una respuesta consistente de la API
const buildApiResponse = (success, data, message = '', version = '1.0.0') => {
  return {
    success,
    data,
    message,
    quantumTimestamp: Date.now(),
    version,
  };
};

// Función de registro
export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    if (!nombre || !email || !password) {
      return res.status(400).json(buildApiResponse(false, null, 'Todos los campos son requeridos'));
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(buildApiResponse(false, null, 'El email ya está registrado'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      nombre, 
      email,
      password: hashedPassword
    });

    if (!process.env.JWT_SECRET) {
      console.error('Error: JWT_SECRET no está definido en las variables de entorno.');
      return res.status(500).json(buildApiResponse(false, null, 'Error de configuración del servidor.'));
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userResponse = {
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    // Log de la respuesta completa ANTES de enviarla
    console.log('✅ Registro exitoso. Respondiendo con:', { user: userResponse, token });
    res.status(201).json(buildApiResponse(true, { user: userResponse, token }, 'Usuario registrado correctamente'));
  } catch (error) {
    console.error('❌ Error en registro del backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor durante el registro';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// Función de login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(buildApiResponse(false, null, 'Email y contraseña son requeridos'));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json(buildApiResponse(false, null, 'Credenciales inválidas'));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(buildApiResponse(false, null, 'Credenciales inválidas'));
    }

    if (!process.env.JWT_SECRET) {
      console.error('Error: JWT_SECRET no está definido en las variables de entorno.');
      return res.status(500).json(buildApiResponse(false, null, 'Error de configuración del servidor.'));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userResponse = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      createdAt: user.createdAt,
    };

    // Log de la respuesta completa ANTES de enviarla
    console.log('✅ Login exitoso. Respondiendo con:', { user: userResponse, token });
    res.json(buildApiResponse(true, { user: userResponse, token }, 'Inicio de sesión exitoso'));
  } catch (error) {
    console.error('❌ Error en login del backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor durante el inicio de sesión';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};
