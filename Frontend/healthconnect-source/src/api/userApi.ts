import { apiClient, executeWithFallback } from './axios';
import type { User, ApiResponse } from '../types';
import { demoUser, getDemoSession, saveDemoProfile } from '../lib/demo';

export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => executeWithFallback(
    () => apiClient.get<ApiResponse<User>>('/api/v1/users/me'),
    () => {
      const session = getDemoSession();
      if (!session) throw new Error('Sign in to the demo to view your profile.');
      return demoUser(session.email);
    },
    'User profile retrieved'
  ),

  updateCurrentUser: async (updates: Partial<User>): Promise<ApiResponse<User>> => executeWithFallback(
    () => apiClient.patch<ApiResponse<User>>('/api/v1/users/me', updates),
    () => {
      const session = getDemoSession();
      if (!session) throw new Error('Sign in to the demo to update your profile.');
      const user = { ...demoUser(session.email), ...updates, id: session.id, email: session.email, role: session.role };
      saveDemoProfile(user);
      return user;
    },
    'Profile updated'
  ),
};
