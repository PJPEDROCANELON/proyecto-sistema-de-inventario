// C:\Users\pedro\Desktop\project\server\utils\apiResponse.js

/**
 * Función de utilidad para construir una respuesta API consistente.
 * @param {boolean} success - Indica si la operación fue exitosa.
 * @param {object|null} data - Los datos de la respuesta (puede ser null para errores o mensajes sin datos).
 * @param {string} [message=''] - Mensaje descriptivo de la respuesta.
 * @param {string} [version='1.0.0'] - Versión de la API.
 * @returns {object} Objeto de respuesta de la API.
 */
export const buildApiResponse = (success, data, message = '', version = '1.0.0') => {
  return {
    success,
    data,
    message,
    quantumTimestamp: Date.now(), // Un timestamp para rastrear la respuesta
    version,
  };
};
