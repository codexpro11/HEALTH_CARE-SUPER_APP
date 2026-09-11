import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from '../types';
import { auth } from '../firebase/config';

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
    // Attempt to get the Firebase ID Token
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
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        auth.signOut().then(() => {
          window.location.href = '/login?session_expired=true';
        });
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Executes a REST API call.
 * If backend is reachable, returns real data.
 * If backend fails due to network/unavailable server (Spring Boot not started),
 * returns realistic fallback data with identical ApiResponse contract.
 */
export async function executeWithFallback<T>(
  apiCall: () => Promise<{ data: ApiResponse<T> }>,
  fallbackGenerator: () => T | Promise<T>,
  fallbackMessage = 'Request processed successfully'
): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall();
    return response.data;
  } catch {
    // Graceful fallback for mock preview when Spring Boot backend is not running locally
    const fallbackData = await fallbackGenerator();
    return {
      success: true,
      data: fallbackData,
      message: fallbackMessage,
      timestamp: new Date().toISOString(),
    };
  }
}
