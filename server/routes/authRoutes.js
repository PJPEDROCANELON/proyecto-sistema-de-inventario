// C:\Users\pedro\Desktop\project\server\routes\authRoutes.js

import { Router } from 'express';
import { body } from 'express-validator';
// MODIFICADO: Importar las nuevas funciones del authController
import { register, login, getMe, updateUserProfile, changePassword } from '../controllers/authController.js';
import { handleValidation } from '../middlewares/validation.js';
import authenticateToken from '../middlewares/authMiddleware.js'; // NUEVO: Importar el middleware de autenticación

const router = Router();

// Validaciones para registro
const registerValidations = [
  body('username') 
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre de usuario debe tener al menos 2 caracteres'),
    
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido'),
    
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para login
const loginValidations = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido'),
    
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

// Rutas de autenticación existentes (no necesitan autenticación de token)
router.post('/register', registerValidations, handleValidation, register); 
router.post('/login', loginValidations, handleValidation, login);

// NUEVAS RUTAS DE GESTIÓN DE USUARIO (requieren autenticación de token)
// Aplica authenticateToken a las rutas que necesitan que el usuario esté logueado
router.get('/me', authenticateToken, getMe); // Obtener datos del usuario autenticado
router.put('/profile', authenticateToken, updateUserProfile); // Actualizar perfil (username, email, preferencias)

// Validaciones para cambiar contraseña
const changePasswordValidations = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];
router.put('/password', authenticateToken, changePasswordValidations, handleValidation, changePassword); // Cambiar contraseña

export default router;
