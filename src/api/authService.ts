// C:\Users\pedro\Desktop\project\src\api\authService.ts

import axios from 'axios'; 
import { LoginPayload, RegisterPayload, AuthResponse, NeoStockResponse, User } from '../types'; 

const API_BASE_URL = 'http://localhost:3001/api/auth'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NUEVO: Interceptor para añadir el token JWT a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class AuthService {
  async login(credentials: LoginPayload): Promise<AuthResponse> { 
    try {
      const response = await axiosInstance.post<NeoStockResponse<AuthResponse>>('/login', credentials);
      if (response.data.success && response.data.data) {
        localStorage.setItem('authToken', response.data.data.token);
        // Asegurarse de que el objeto user guardado incluye todas las propiedades
        localStorage.setItem('user', JSON.stringify(response.data.data.user)); 
        return response.data.data; 
      }
      throw new Error(response.data.message || 'Error de inicio de sesión');
    } catch (error: unknown) {
      console.error('Login error:', error);
      let errorMessage = 'Error al iniciar sesión';

      if (axios.isAxiosError(error)) { 
        if (error.response && (error.response.data as NeoStockResponse<unknown>)?.message) {
          errorMessage = (error.response.data as NeoStockResponse<unknown>).message || error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  async register(userData: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<NeoStockResponse<AuthResponse>>('/register', userData);
      if (response.data.success && response.data.data) {
        localStorage.setItem('authToken', response.data.data.token);
        // Asegurarse de que el objeto user guardado incluye todas las propiedades
        localStorage.setItem('user', JSON.stringify(response.data.data.user)); 
        return response.data.data; 
      }
      throw new Error(response.data.message || 'Error de registro');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      let errorMessage = 'Error al registrar usuario';

      if (axios.isAxiosError(error)) {
        if (error.response && (error.response.data as NeoStockResponse<unknown>)?.message) {
          errorMessage = (error.response.data as NeoStockResponse<unknown>).message || error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        return null;
      }
    }
    return null;
  }

  // NUEVO: Método para obtener los datos completos del usuario desde el backend
  async getMe(): Promise<User> {
    try {
      const response = await axiosInstance.get<NeoStockResponse<User>>('/me');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener los datos del usuario.');
    } catch (error: unknown) {
      console.error('Error in getMe:', error);
      let errorMessage = 'Error al obtener los datos del usuario.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  // NUEVO: Método para actualizar el perfil del usuario (incluyendo las nuevas preferencias)
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await axiosInstance.put<NeoStockResponse<User>>('/profile', userData);
      if (response.data.success && response.data.data) {
        // Almacenar el usuario actualizado en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al actualizar el perfil.');
    } catch (error: unknown) {
      console.error('Error in updateUserProfile:', error);
      let errorMessage = 'Error al actualizar el perfil.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  // NUEVO: Método para cambiar la contraseña del usuario
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await axiosInstance.put<NeoStockResponse<null>>('/password', { currentPassword, newPassword });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al cambiar la contraseña.');
      }
    } catch (error: unknown) {
      console.error('Error in changePassword:', error);
      let errorMessage = 'Error al cambiar la contraseña.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
}

export default new AuthService();
