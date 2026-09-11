import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, Hospital } from '../types';
import { mockHospitals } from '../data/mockData';

export const hospitalApi = {
  getHospitals: async (filter?: {
    specialization?: string;
    emergencyOnly?: boolean;
    icuOnly?: boolean;
    searchQuery?: string;
    search?: string;
  }): Promise<ApiResponse<Hospital[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/hospitals', { params: filter }),
      () => {
        let list = [...mockHospitals];
        if (!filter) return list;
        const query = filter.search || filter.searchQuery;
        if (query) {
          const q = query.toLowerCase();
          list = list.filter((h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q));
        }
        if (filter.specialization && filter.specialization !== 'ALL') {
          list = list.filter((h) =>
            h.specializations.some((s) => s.toLowerCase().includes(filter.specialization!.toLowerCase()))
          );
        }
        if (filter.emergencyOnly) {
          list = list.filter((h) => h.hasEmergency);
        }
        if (filter.icuOnly) {
          list = list.filter((h) => h.bedAvailability.icuAvailable > 0);
        }
        return list;
      },
      'Hospitals retrieved'
    );
  },

  getHospitalById: async (id: string): Promise<ApiResponse<Hospital>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/hospitals/${id}`),
      () => {
        const found = mockHospitals.find((h) => h.id === id) || mockHospitals[0];
        return found;
      },
      'Hospital details retrieved'
    );
  },
};
