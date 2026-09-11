import { apiClient, executeWithFallback } from './axios';
import { User, ApiResponse } from '../types';
import { mockCurrentUser } from '../data/mockData';

export const patientApi = {
  getCurrentPatient: async (): Promise<ApiResponse<User>> => {
    return executeWithFallback(
      () => apiClient.get<ApiResponse<User>>('/api/v1/patients/me'),
      () => mockCurrentUser,
      'Patient details retrieved successfully'
    );
  }
};

