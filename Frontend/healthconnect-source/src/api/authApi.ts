import { apiClient, executeWithFallback } from './axios';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types';
import { mockCurrentUser } from '../data/mockData';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/auth/login', credentials),
      () => {
        const dummyAccessToken = 'jwt-dummy-access-token-hc-patient';
        const dummyRefreshToken = 'jwt-dummy-refresh-token-hc-patient';
        
        return {
          accessToken: dummyAccessToken,
          refreshToken: dummyRefreshToken,
          expiresIn: 3600,
          user: {
            ...mockCurrentUser,
            email: credentials.email || mockCurrentUser.email,
          },
        };
      },
      'User authenticated successfully'
    );
  },

  register: async (payload: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/auth/register', payload),
      () => {
        const dummyAccessToken = 'jwt-dummy-access-token-registered';
        const dummyRefreshToken = 'jwt-dummy-refresh-token-registered';
        
        const newUser: User = {
          id: `usr-${Date.now()}`,
          fullName: payload.fullName,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          role: payload.role || 'PATIENT',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        return {
          accessToken: dummyAccessToken,
          refreshToken: dummyRefreshToken,
          expiresIn: 3600,
          user: newUser,
        };
      },
      'Registration completed successfully'
    );
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/auth/refresh', { refreshToken }),
      () => ({
        accessToken: `refreshed-token-${Date.now()}`,
        refreshToken: `refreshed-rt-${Date.now()}`,
      }),
      'Token refreshed successfully'
    );
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/auth/logout'),
      () => {
        
        return { message: 'Logged out successfully' };
      },
      'User session terminated'
    );
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/auth/me'),
      () => mockCurrentUser,
      'Profile retrieved successfully'
    );
  },
};
