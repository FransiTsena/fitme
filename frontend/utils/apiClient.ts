import { API_BASE_URL } from '@/constants/api';

// Create an API client to handle all API requests
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005/api';
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Include authorization header if needed
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get token from storage (implement based on your storage solution)
  private getToken(): string | null {
    // This would get the token from your auth store
    // For now, we'll implement it when we set up the store
    return null;
  }
}

export const apiClient = new ApiClient();