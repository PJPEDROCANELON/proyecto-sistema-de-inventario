// server/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // 1. Errores de validación (express-validator)
  if (err.name === 'ValidationError' || err.array) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.array?.() || Object.values(err.errors).map(e => e.msg)
    });
  }

  // 2. Errores de autenticación JWT
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // 3. Errores de Sequelize (base de datos)
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Error en base de datos',
      detalles: err.errors.map(e => e.message)
    });
  }

  // 4. Error genérico
  console.error('🔥 Error:', err.stack);
  
  // 5. Responder al cliente
  res.status(500).json({ 
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? err.message : 'Contacta al administrador'
  });
};

// Exportación para ES Modules
export default errorHandler;