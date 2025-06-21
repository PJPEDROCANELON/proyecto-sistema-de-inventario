import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, AxiosHeaders } from 'axios';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  quantumIdPrefix: string;
}

interface NeoStockResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  quantumTimestamp: number;
  version: string;
}

interface NeoStockError {
  code: string;
  message: string;
  details?: unknown;
  quantumTrace?: string;
}

class ApiGateway {
  private client: AxiosInstance;
  private config: ApiConfig;
  private retryCount: Map<string, number> = new Map();

  constructor() {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      retryAttempts: 3,
      quantumIdPrefix: import.meta.env.VITE_QUANTUM_ID_PREFIX || 'QS'
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'NeoStock-Version': '1.0.0',
        'Content-Type': 'application/json',
        'X-Quantum-Client': 'NeoStock-Frontend'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        } else if (!(config.headers instanceof AxiosHeaders)) {
          config.headers = AxiosHeaders.from(config.headers);
        }

        config.headers.set('X-Quantum-Timestamp', Date.now().toString());
        const token = this.getAuthToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.transformError(error));
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse<NeoStockResponse>): AxiosResponse<NeoStockResponse> => {
        return response; 
      },
      async (error: AxiosError) => {
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: AxiosError): NeoStockError {
    const requestId = error.config?.url || 'unknown';
    const currentRetries = this.retryCount.get(requestId) || 0;

    if (this.shouldRetry(error) && currentRetries < this.config.retryAttempts) {
      this.retryCount.set(requestId, currentRetries + 1);
      return {
        code: 'RETRYING',
        message: `Retrying request (${currentRetries + 1}/${this.config.retryAttempts})`
      };
    }

    this.retryCount.delete(requestId);

    const neoStockError: NeoStockError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error.response?.data, 
      quantumTrace: `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    return neoStockError;
  }

  private shouldRetry(error: AxiosError): boolean {
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken'); 
  }

  // Métodos de API públicos
  public async get<T>(url: string, config?: AxiosRequestConfig<unknown>): Promise<NeoStockResponse<T>> {
    const response = await this.client.get<NeoStockResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig<unknown>): Promise<NeoStockResponse<T>> {
    const response = await this.client.post<NeoStockResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig<unknown>): Promise<NeoStockResponse<T>> {
    const response = await this.client.put<NeoStockResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig<unknown>): Promise<NeoStockResponse<T>> {
    const response = await this.client.delete<NeoStockResponse<T>>(url, config);
    return response.data;
  }

  public generateQuantumId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${this.config.quantumIdPrefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Verifica el estado de conexión con el backend haciendo una petición GET a un endpoint de salud.
   * Se asume que el backend tiene un endpoint /status o /health que responde.
   * @returns Una promesa que resuelve a `true` si la conexión es exitosa, `false` en caso contrario.
   */
  public async getConnectionStatus(): Promise<boolean> {
    try {
      // Intenta hacer una petición a un endpoint simple de tu backend.
      // Puedes cambiar '/status' a '/health' o cualquier otro endpoint que tu backend exponga para este propósito.
      const response = await this.client.get('/status'); 
      // Si recibimos una respuesta exitosa (código 2xx), consideramos que hay conexión.
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      // Cualquier error (red, 4xx, 5xx) significa que no hay conexión o no es exitosa.
      console.error('Error checking backend connection status:', error);
      return false;
    }
  }
}

export default new ApiGateway();
