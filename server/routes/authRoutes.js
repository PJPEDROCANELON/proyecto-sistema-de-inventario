import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import { handleValidation } from '../middlewares/validation.js';

const router = Router();

// Validaciones para registro
const registerValidations = [
  body('name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    
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

// Aplicar validaciones a las rutas
router.post('/register', registerValidations, handleValidation, register);
router.post('/login', loginValidations, handleValidation, login);

export default router;