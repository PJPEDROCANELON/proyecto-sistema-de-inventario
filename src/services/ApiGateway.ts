import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Configuration interface for API Gateway
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  quantumIdPrefix: string;
}

// Response wrapper for consistent API responses
interface NeoStockResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  quantumTimestamp: number;
  version: string;
}

// Error interface for standardized error handling
interface NeoStockError {
  code: string;
  message: string;
  details?: any;
  quantumTrace?: string;
}

class ApiGateway {
  private client: AxiosInstance;
  private config: ApiConfig;
  private retryCount: Map<string, number> = new Map();

  constructor() {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
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
        'X-Quantum-Client': 'NeoStock-Frontend',
        'X-Cyberpunk-Mode': 'enabled'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for adding authentication and logging
    this.client.interceptors.request.use(
      (config) => {
        // Add quantum timestamp to all requests
        config.headers['X-Quantum-Timestamp'] = Date.now().toString();
        
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Log request in debug mode
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('🚀 NeoStock API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        console.error('🚨 Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and data transformation
    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse<NeoStockResponse> => {
        // Transform response to NeoStock format
        const transformedResponse: NeoStockResponse = {
          success: true,
          data: response.data,
          quantumTimestamp: Date.now(),
          version: '1.0.0'
        };

        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('✅ NeoStock API Response:', {
            status: response.status,
            url: response.config.url,
            data: transformedResponse
          });
        }

        return {
          ...response,
          data: transformedResponse
        };
      },
      async (error: AxiosError) => {
        const requestId = error.config?.url || 'unknown';
        const currentRetries = this.retryCount.get(requestId) || 0;

        // Retry logic for network errors
        if (this.shouldRetry(error) && currentRetries < this.config.retryAttempts) {
          this.retryCount.set(requestId, currentRetries + 1);
          
          console.warn(`🔄 Retrying request (${currentRetries + 1}/${this.config.retryAttempts}):`, requestId);
          
          // Exponential backoff
          await this.delay(Math.pow(2, currentRetries) * 1000);
          
          return this.client.request(error.config!);
        }

        // Clear retry count after max attempts
        this.retryCount.delete(requestId);

        // Transform error to NeoStock format
        const neoStockError: NeoStockError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unknown error occurred',
          details: error.response?.data,
          quantumTrace: `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        console.error('🚨 NeoStock API Error:', neoStockError);

        // Show user-friendly error notification
        this.handleErrorNotification(neoStockError);

        return Promise.reject(neoStockError);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getAuthToken(): string | null {
    // Get token from localStorage or secure storage
    return localStorage.getItem('neostock_auth_token');
  }

  private handleErrorNotification(error: NeoStockError): void {
    // This would integrate with your notification system
    // For now, we'll use console.error, but you can replace with toast notifications
    const userMessage = this.getUserFriendlyErrorMessage(error.code);
    console.error(`🔴 ${userMessage}`);
  }

  private getUserFriendlyErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Connection to NeoStock servers lost. Retrying...',
      'UNAUTHORIZED': 'Neural authentication required. Please verify your identity.',
      'FORBIDDEN': 'Access denied. Insufficient quantum clearance level.',
      'NOT_FOUND': 'Requested data not found in the quantum database.',
      'TIMEOUT': 'Request timeout. NeoStock servers may be under heavy load.',
      'SERVER_ERROR': 'Internal server malfunction. Engineering team notified.'
    };

    return errorMessages[errorCode] || 'An unexpected error occurred in the NeoStock system.';
  }

  // Public methods for making API calls
  public async get<T = any>(url: string, config?: any): Promise<NeoStockResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: any): Promise<NeoStockResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: any): Promise<NeoStockResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: any): Promise<NeoStockResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: any): Promise<NeoStockResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  // Utility methods
  public generateQuantumId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${this.config.quantumIdPrefix}-${timestamp}-${random}`.toUpperCase();
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public getConnectionStatus(): 'online' | 'offline' | 'unstable' {
    if (!navigator.onLine) return 'offline';
    
    // Check if we have recent successful requests
    const lastSuccessfulRequest = localStorage.getItem('neostock_last_success');
    if (lastSuccessfulRequest) {
      const timeDiff = Date.now() - parseInt(lastSuccessfulRequest);
      if (timeDiff > 30000) return 'unstable'; // 30 seconds threshold
    }
    
    return 'online';
  }
}

// Export singleton instance
export default new ApiGateway();