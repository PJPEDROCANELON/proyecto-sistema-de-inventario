import axios from 'axios';

// Determinar la URL base de la API dinámicamente
let API_BASE_URL;

// Si la aplicación está corriendo en un entorno de producción (Vercel)
// o si el hostname no es localhost, usamos la URL de Railway.
// De lo contrario (en desarrollo local), usamos localhost.
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
  // Entorno de desarrollo local
  API_BASE_URL = 'http://localhost:3001/api';
} else {
  // Entorno de producción (Vercel)
  // Usamos directamente la URL de tu backend en Railway
  API_BASE_URL = 'https://neostock.up.railway.app/api';
}

console.log(`[Axios Config] API Base URL set to: ${API_BASE_URL}`);

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL, // Usar la URL base determinada dinámicamente
  timeout: 10000, // 10 segundos máximo de espera
});

// Interceptor de solicitud para depuración
api.interceptors.request.use(
  (config) => {
    console.log(`[Axios Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para depuración y manejo de errores
api.interceptors.response.use(
  (response) => {
    console.log(`[Axios Response] ${response.config.method.toUpperCase()} ${response.config.url} Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[Axios Response Error]', error.response || error.message);
    if (error.response) {
      throw {
        message: error.response.data.message || 'Error en la solicitud',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    } else if (error.request) {
      throw new Error('Error de red o no se recibió respuesta del servidor');
    } else {
      throw new Error('Error al configurar la solicitud');
    }
  }
);

// Función para registrar usuario
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Función para iniciar sesión
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export default api;
