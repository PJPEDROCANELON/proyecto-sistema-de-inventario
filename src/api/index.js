import axios from 'axios';

// Obtener la URL base de la API desde las variables de entorno de Vite
// En desarrollo, será 'http://localhost:3001/api' (desde .env.development o .env)
// En producción (desplegado en Vercel), será la URL configurada en Vercel (ej. https://neostock.up.railway.app/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL, // CAMBIO CLAVE AQUÍ: Usar la variable de entorno
  timeout: 10000, // 10 segundos máximo de espera
});

// Interceptor de solicitud para depuración (opcional, puedes quitarlo si no lo necesitas)
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
    // Convertir error de Axios a un formato más manejable
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      throw {
        message: error.response.data.message || 'Error en la solicitud',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta (ej. Network Error)
      throw new Error('Error de red o no se recibió respuesta del servidor');
    } else {
      // Algo pasó al configurar la solicitud
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
    console.error('Registration error:', error); // Log del error original de Axios
    throw error; // Re-lanza el error para que sea manejado por el componente de UI
  }
};

// Función para iniciar sesión
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    console.error('Login error:', error); // Log del error original de Axios
    throw error;
  }
};

// Más funciones de API pueden ir aquí (ej. para productos, órdenes, etc.)
// Ejemplo:
// export const getProducts = async () => {
//   try {
//     const response = await api.get('/inventory/products');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// };

export default api; // Exporta la instancia de Axios por si la necesitas en otros lugares
