// C:\Users\pedro\Desktop\project\server\middleware\authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { buildApiResponse } from '../utils/apiResponse.js'; // Asegúrate de que la ruta sea correcta

dotenv.config();

// Middleware para verificar el token JWT y añadir el usuario a la solicitud
const authMiddleware = (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json(buildApiResponse(false, null, 'Acceso denegado. No se proporcionó token.'));
  }

  // El token suele venir como 'Bearer TOKEN_STRING'. Extraer solo TOKEN_STRING.
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(buildApiResponse(false, null, 'Acceso denegado. Formato de token inválido.'));
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('Error: JWT_SECRET no está definido en las variables de entorno.');
      return res.status(500).json(buildApiResponse(false, null, 'Error de configuración del servidor.'));
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Token decodificado:', decoded); // Debug: ver el contenido del token

    // Adjuntar el ID del usuario decodificado al objeto de solicitud
    // Esto hace que req.user.id esté disponible en los controladores
    req.user = { id: decoded.id, email: decoded.email }; 
    next(); // Pasar al siguiente middleware/controlador
  } catch (error) {
    console.error('Error al verificar token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(buildApiResponse(false, null, 'Token expirado. Por favor, inicie sesión de nuevo.'));
    }
    return res.status(401).json(buildApiResponse(false, null, 'Token inválido. Acceso denegado.'));
  }
};

export default authMiddleware;
