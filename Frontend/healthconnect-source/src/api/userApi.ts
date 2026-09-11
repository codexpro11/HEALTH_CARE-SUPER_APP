import { apiClient, executeWithFallback } from './axios';
import { User, ApiResponse } from '../types';
import { mockCurrentUser } from '../data/mockData';
import { auth } from '../firebase/config';

export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return executeWithFallback(
      () => apiClient.get<ApiResponse<User>>('/api/v1/users/me'),
      () => {
        // Return mock user but try to use Firebase auth details if available
        const fbUser = auth.currentUser;
        return {
          ...mockCurrentUser,
          email: fbUser?.email || mockCurrentUser.email,
          fullName: fbUser?.displayName || mockCurrentUser.fullName,
        };
      },
      'User profile retrieved successfully'
    );
  }
};

