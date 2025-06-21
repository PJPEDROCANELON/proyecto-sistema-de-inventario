// C:\Users\pedro\Desktop\project\server\middlewares\validation.js

// Importa validationResult desde express-validator
import { validationResult } from 'express-validator'; // <-- ¡Añadido!

// Middleware para manejar los resultados de la validación
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req); // Usa validationResult aquí
  if (!errors.isEmpty()) {
    // Si hay errores de validación, devuelve una respuesta 400 con los errores
    return res.status(400).json({ errors: errors.array() });
  }
  // Si no hay errores, pasa al siguiente middleware/controlador
  next();
};
