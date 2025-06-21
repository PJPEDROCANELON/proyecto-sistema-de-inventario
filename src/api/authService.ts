// C:\Users\pedro\Desktop\project\src\api\authService.ts

import apiClient from './apiClient'; 
import { LoginPayload, RegisterPayload, AuthResponse, NeoStockResponse } from '../types/index'; // <-- CAMBIO AQUÍ

const AuthService = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    try {
      const axiosResponse = await apiClient.post<NeoStockResponse<AuthResponse>>('/api/auth/registro', data); 
      console.log("AuthService.register: AxiosResponse completa:", axiosResponse); 
      
      const apiResponseData = axiosResponse.data;

      if (apiResponseData && apiResponseData.data && apiResponseData.data.user && apiResponseData.data.token) {
        localStorage.setItem('authToken', apiResponseData.data.token);
        localStorage.setItem('user', JSON.stringify(apiResponseData.data.user));
        console.log("AuthService.register: Usuario guardado en localStorage y token:", apiResponseData.data.user.email);
        return { user: apiResponseData.data.user, token: apiResponseData.data.token };
      } else {
        throw new Error("Datos de registro incompletos en la respuesta del servidor. Respuesta: " + JSON.stringify(apiResponseData));
      }
    } catch (error) {
      console.error('Error al registrar usuario en AuthService:', error);
      throw error; 
    }
  },

  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      const axiosResponse = await apiClient.post<NeoStockResponse<AuthResponse>>('/api/auth/login', credentials);
      console.log("AuthService.login: AxiosResponse completa:", axiosResponse); 
      
      const apiResponseData = axiosResponse.data;

      if (apiResponseData && apiResponseData.data && apiResponseData.data.user && apiResponseData.data.token) {
        localStorage.setItem('authToken', apiResponseData.data.token);
        localStorage.setItem('user', JSON.stringify(apiResponseData.data.user));
        console.log("AuthService.login: Usuario guardado en localStorage y token:", apiResponseData.data.user.email);
        return { user: apiResponseData.data.user, token: apiResponseData.data.token };
      } else {
        throw new Error("Credenciales inválidas o datos de login incompletos en la respuesta del servidor. Respuesta: " + JSON.stringify(apiResponseData));
      }
    } catch (error) {
      console.error('Error al iniciar sesión en AuthService:', error);
      throw error; 
    }
  },

  logout: () => {
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user'); 
  },
};

export default AuthService;
