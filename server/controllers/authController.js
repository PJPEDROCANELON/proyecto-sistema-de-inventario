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
    const { username, email, password } = req.body; 
    
    if (!username || !email || !password) {
      return res.status(400).json(buildApiResponse(false, null, 'Todos los campos son requeridos (username, email, password).'));
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(buildApiResponse(false, null, 'El email ya está registrado.'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Al crear un nuevo usuario, se usarán los valores por defecto definidos en el modelo User
    const newUser = await User.create({
      username, 
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

    // Asegurarse de no enviar el hash de la contraseña en la respuesta
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      // Incluir las nuevas preferencias en la respuesta inicial del usuario
      lowStockAlertEnabled: newUser.lowStockAlertEnabled,
      outOfStockAlertEnabled: newUser.outOfStockAlertEnabled,
      notificationFrequency: newUser.notificationFrequency,
      defaultMinStockThreshold: newUser.defaultMinStockThreshold,
      defaultOverstockMultiplier: newUser.defaultOverstockMultiplier,
      defaultQuantityUnit: newUser.defaultQuantityUnit,
      defaultCurrencySymbol: newUser.defaultCurrencySymbol,
      defaultDateFormat: newUser.defaultDateFormat,
      defaultTimeFormat: newUser.defaultTimeFormat,
      themePreference: newUser.themePreference,
    };

    console.log('✅ Registro exitoso. Respondiendo con:', { user: userResponse, token });
    res.status(201).json(buildApiResponse(true, { user: userResponse, token }, 'Usuario registrado correctamente.'));
  } catch (error) {
    console.error('❌ Error en registro del backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor durante el registro.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// Función de login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(buildApiResponse(false, null, 'Email y contraseña son requeridos.'));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json(buildApiResponse(false, null, 'Credenciales inválidas.'));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(buildApiResponse(false, null, 'Credenciales inválidas.'));
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

    // Asegurarse de no enviar el hash de la contraseña en la respuesta
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      // Incluir las nuevas preferencias en la respuesta de login
      lowStockAlertEnabled: user.lowStockAlertEnabled,
      outOfStockAlertEnabled: user.outOfStockAlertEnabled,
      notificationFrequency: user.notificationFrequency,
      defaultMinStockThreshold: user.defaultMinStockThreshold,
      defaultOverstockMultiplier: user.defaultOverstockMultiplier,
      defaultQuantityUnit: user.defaultQuantityUnit,
      defaultCurrencySymbol: user.defaultCurrencySymbol,
      defaultDateFormat: user.defaultDateFormat,
      defaultTimeFormat: user.defaultTimeFormat,
      themePreference: user.themePreference,
    };

    console.log('✅ Login exitoso. Respondiendo con:', { user: userResponse, token });
    res.json(buildApiResponse(true, { user: userResponse, token }, 'Inicio de sesión exitoso.'));
  } catch (error) {
    console.error('❌ Error en login del backend (DETALLE):', error);
    const errorMessage = error.message || 'Error interno del servidor durante el inicio de sesión.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// NUEVA FUNCIÓN: Obtener datos del usuario autenticado
export const getMe = async (req, res) => {
  const userId = req.user.id;
  console.log(`🔵 [Backend] Recibida petición para obtener datos del usuario autenticado: ${userId}`);

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Excluir el hash de la contraseña
    });

    if (!user) {
      console.warn(`⚠️ [Backend] Usuario ${userId} no encontrado.`);
      return res.status(404).json(buildApiResponse(false, null, 'Usuario no encontrado.'));
    }

    console.log('✅ [Backend] Datos del usuario obtenidos exitosamente:', user.email);
    res.status(200).json(buildApiResponse(true, user, 'Datos del usuario obtenidos correctamente.'));

  } catch (error) {
    console.error('❌ [Backend] Error al obtener datos del usuario:', error);
    const errorMessage = error.message || 'Error interno del servidor al obtener los datos del usuario.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// NUEVA FUNCIÓN: Actualizar el perfil y las preferencias del usuario
export const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  console.log(`🔵 [Backend] Recibida petición para actualizar perfil y preferencias del usuario: ${userId}. Datos:`, req.body);

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      console.warn(`⚠️ [Backend] Usuario ${userId} no encontrado para actualización.`);
      return res.status(404).json(buildApiResponse(false, null, 'Usuario no encontrado.'));
    }

    const {
      username,
      email,
      lowStockAlertEnabled,
      outOfStockAlertEnabled,
      notificationFrequency,
      defaultMinStockThreshold,
      defaultOverstockMultiplier,
      defaultQuantityUnit,
      defaultCurrencySymbol,
      defaultDateFormat,
      defaultTimeFormat,
      themePreference,
    } = req.body;

    // Validaciones básicas antes de actualizar
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ where: { email } });
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return res.status(400).json(buildApiResponse(false, null, 'El correo electrónico ya está en uso por otra cuenta.'));
      }
    }

    // Actualizar solo los campos que se proporcionaron en el body
    const updateFields = {};
    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;
    if (lowStockAlertEnabled !== undefined) updateFields.lowStockAlertEnabled = lowStockAlertEnabled;
    if (outOfStockAlertEnabled !== undefined) updateFields.outOfStockAlertEnabled = outOfStockAlertEnabled;
    if (notificationFrequency !== undefined) updateFields.notificationFrequency = notificationFrequency;
    if (defaultMinStockThreshold !== undefined) updateFields.defaultMinStockThreshold = defaultMinStockThreshold;
    if (defaultOverstockMultiplier !== undefined) updateFields.defaultOverstockMultiplier = defaultOverstockMultiplier;
    if (defaultQuantityUnit !== undefined) updateFields.defaultQuantityUnit = defaultQuantityUnit;
    if (defaultCurrencySymbol !== undefined) updateFields.defaultCurrencySymbol = defaultCurrencySymbol;
    if (defaultDateFormat !== undefined) updateFields.defaultDateFormat = defaultDateFormat;
    if (defaultTimeFormat !== undefined) updateFields.defaultTimeFormat = defaultTimeFormat;
    if (themePreference !== undefined) updateFields.themePreference = themePreference;

    await user.update(updateFields);

    // No devolver la contraseña
    const updatedUserResponse = { ...user.toJSON() };
    delete updatedUserResponse.password;

    console.log('✅ [Backend] Perfil y preferencias de usuario actualizados exitosamente:', updatedUserResponse.email);
    res.status(200).json(buildApiResponse(true, updatedUserResponse, 'Perfil y preferencias actualizados correctamente.'));

  } catch (error) {
    console.error('❌ [Backend] Error al actualizar perfil y preferencias del usuario:', error);
    const errorMessage = error.message || 'Error interno del servidor al actualizar el perfil.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};

// NUEVA FUNCIÓN: Cambiar la contraseña del usuario
export const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  console.log(`🔵 [Backend] Recibida petición para cambiar contraseña del usuario: ${userId}`);

  if (!currentPassword || !newPassword) {
    return res.status(400).json(buildApiResponse(false, null, 'Contraseña actual y nueva contraseña son requeridas.'));
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      console.warn(`⚠️ [Backend] Usuario ${userId} no encontrado para cambio de contraseña.`);
      return res.status(404).json(buildApiResponse(false, null, 'Usuario no encontrado.'));
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      console.warn(`⚠️ [Backend] Intento de cambio de contraseña con contraseña actual incorrecta para usuario: ${userId}`);
      return res.status(401).json(buildApiResponse(false, null, 'Contraseña actual incorrecta.'));
    }

    // Opcional: Añadir validaciones de complejidad para newPassword (ej. longitud mínima, caracteres especiales)
    if (newPassword.length < 6) {
      return res.status(400).json(buildApiResponse(false, null, 'La nueva contraseña debe tener al menos 6 caracteres.'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword });

    console.log('✅ [Backend] Contraseña del usuario actualizada exitosamente:', user.email);
    res.status(200).json(buildApiResponse(true, null, 'Contraseña actualizada correctamente.'));

  } catch (error) {
    console.error('❌ [Backend] Error al cambiar la contraseña del usuario:', error);
    const errorMessage = error.message || 'Error interno del servidor al cambiar la contraseña.';
    res.status(500).json(buildApiResponse(false, null, errorMessage));
  }
};
