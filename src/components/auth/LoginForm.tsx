import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { User, BackendErrorResponse, AuthResponse } from '../../types'; 
import AuthService from '../../api/authService';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void; 
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); 

    try {
      console.log("LoginForm: Intentando iniciar sesión con", email);

      const loginResult: AuthResponse = await AuthService.login({ email, password }); 
      
      console.log("LoginForm: Resultado de AuthService.login (AuthResponse):", loginResult);

      if (!loginResult || !loginResult.user) {
        console.error("LoginForm: loginResult o loginResult.user es undefined/null:", loginResult);
        setError('Error: Los datos de usuario no se recibieron correctamente.');
        setIsLoading(false);
        return; 
      }

      console.log("LoginForm: Pasando usuario a onLoginSuccess:", loginResult.user); // <-- NUEVO LOG
      onLoginSuccess(loginResult.user); 
    } catch (err: unknown) {
      setIsLoading(false);
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
        const backendError = err.response.data as BackendErrorResponse;
        if (backendError.errors && backendError.errors.length > 0) {
          setError(backendError.errors[0].msg);
        } else if (backendError.message) {
          setError(backendError.message);
        } else {
          setError('Error desconocido al iniciar sesión. Por favor, inténtelo de nuevo.');
        }
      } else if (err instanceof Error) {
        setError(`Error de red o desconocido: ${err.message}`);
      } else {
        setError('Error inesperado al iniciar sesión.');
      }
      console.error('Error durante el login:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Inicia Sesión en tu Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none focus:underline"
            >
              Regístrate aquí
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
              <label htmlFor="email-address" className="sr-only">Dirección de Correo</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-px"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
