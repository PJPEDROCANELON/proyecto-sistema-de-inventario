// C:\Users\pedro\Desktop\project\src\components\auth\RegisterForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../api/authService'; 
// CORREGIDO: Eliminada la importación directa de 'User'
import { RegisterPayload, BackendErrorResponse, AuthResponse } from '../../types'; 
import axios from 'axios'; 

// onRegisterSuccess espera un objeto AuthResponse
interface RegisterFormProps {
  onRegisterSuccess: (authResponse: AuthResponse) => void; 
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const registerData: RegisterPayload = { username, email, password };
      
      const authResult: AuthResponse = await AuthService.register(registerData); 
      
      console.log("RegisterForm: Resultado de AuthService.register (AuthResponse):", authResult);

      if (!authResult || !authResult.user) { 
        console.error("RegisterForm: Objeto de usuario no recibido después del registro:", authResult);
        setError('Error: Los datos de usuario no se recibieron correctamente.');
        setLoading(false);
        return; 
      }

      // Pasar el objeto AuthResponse completo a onRegisterSuccess
      console.log("RegisterForm: Pasando AuthResponse completa a onRegisterSuccess:", authResult);
      onRegisterSuccess(authResult); 
      
    } catch (err: unknown) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const backendError = err.response.data as BackendErrorResponse;
        if (backendError.errors && backendError.errors.length > 0) {
          setError(backendError.errors[0].msg);
        } else if (backendError.message) {
          setError(backendError.message);
        } else {
          setError('Error desconocido al registrarse. Por favor, inténtelo de nuevo.');
        }
      } else if (err instanceof Error) {
        setError(`Error de red o desconocido: ${err.message}`);
      } else {
        setError('Error inesperado al registrarse.');
      }
      console.error('Error durante el registro:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Regístrate para crear una cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none focus:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-md p-3 text-sm text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Nombre de Usuario</label>
              <input
                id="username" 
                name="username" 
                type="text"
                autoComplete="username" 
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre de Usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Dirección de Correo</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:sm mt-px"
                placeholder="Dirección de Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-px"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirmar Contraseña</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-px"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
