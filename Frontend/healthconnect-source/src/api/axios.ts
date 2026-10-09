import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from '../types';
import { getFirebaseAuth } from '../firebase/config';
import { isDemoMode, getDemoScenario } from '../lib/demo';
import { executeRequest } from '../lib/request';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for Bearer token injection
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isDemoMode) return config;
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to get Firebase token', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with 401 token refresh queue handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    // Firebase Web SDK automatically handles ID token refresh. 
    // If we receive a 401, the user is generally unauthenticated or the session has expired entirely.
    if (!isDemoMode && error.response?.status === 401) {
      const auth = getFirebaseAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        auth.signOut().then(() => {
          window.location.href = '/login?session_expired=true';
        });
      }
    }
    return Promise.reject(error);
  }
);

/** Use mock data only when explicitly running the frontend demo. */
export async function executeWithFallback<T>(
  apiCall: () => Promise<{ data: ApiResponse<T> }>,
  fallbackGenerator: () => T | Promise<T>,
  fallbackMessage = 'Request processed successfully'
): Promise<ApiResponse<T>> {
  return executeRequest(apiCall, fallbackGenerator, {
    demo: isDemoMode, scenario: getDemoScenario(), message: fallbackMessage,
  });
}
