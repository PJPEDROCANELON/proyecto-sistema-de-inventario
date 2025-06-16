import axios from 'axios';

// Crear instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL de tu backend
  timeout: 10000, // 10 segundos máximo de espera
});

// Función para registrar usuario
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
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
      // La solicitud fue hecha pero no se recibió respuesta
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Algo pasó al configurar la solicitud
      throw new Error('Error al configurar la solicitud');
    }
  }
};

// Más funciones de API pueden ir aquí