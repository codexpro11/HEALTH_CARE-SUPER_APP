import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, Doctor, DoctorFilter } from '../types';
import { mockDoctors } from '../data/mockData';

export const doctorApi = {
  getDoctors: async (filter?: DoctorFilter): Promise<ApiResponse<Doctor[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/doctors', { params: filter }),
      () => {
        let results = [...mockDoctors];
        if (!filter) return results;

        if (filter.searchQuery) {
          const q = filter.searchQuery.toLowerCase();
          results = results.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.specialization.toLowerCase().includes(q) ||
              d.location.toLowerCase().includes(q)
          );
        }
        if (filter.specialization && filter.specialization !== 'ALL') {
          results = results.filter(
            (d) => d.specialization.toLowerCase() === filter.specialization?.toLowerCase()
          );
        }
        if (filter.consultationType) {
          results = results.filter((d) => d.consultationTypes.includes(filter.consultationType!));
        }
        if (filter.minRating) {
          results = results.filter((d) => d.rating >= filter.minRating!);
        }
        if (filter.maxFee) {
          results = results.filter((d) => d.consultationFee <= filter.maxFee!);
        }
        if (filter.experienceYears) {
          results = results.filter((d) => d.experienceYears >= filter.experienceYears!);
        }
        return results;
      },
      'Doctors fetched successfully'
    );
  },

  getDoctorById: async (id: string): Promise<ApiResponse<Doctor>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/doctors/${id}`),
      () => {
        const doc = mockDoctors.find((d) => d.id === id) || mockDoctors[0];
        return doc;
      },
      'Doctor details retrieved'
    );
  },
};
