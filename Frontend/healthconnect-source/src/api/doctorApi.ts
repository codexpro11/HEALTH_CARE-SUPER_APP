import { apiClient, executeWithFallback } from './axios';
import type { ApiResponse, Doctor, DoctorFilter } from '../types';
import { mockDoctors } from '../data/mockData';
import { demoSchedule, filterDoctors } from '../lib/frontend';

export const doctorApi = {
  getDoctors: async (filter?: DoctorFilter): Promise<ApiResponse<Doctor[]>> => executeWithFallback(
    () => apiClient.get('/api/v1/doctors', { params: filter }),
    () => filterDoctors(mockDoctors.map(doctor => demoSchedule(doctor)), filter),
    'Doctors fetched'
  ),
  getDoctorById: async (id: string): Promise<ApiResponse<Doctor>> => executeWithFallback(
    () => apiClient.get('/api/v1/doctors/' + id),
    () => {
      const doctor = mockDoctors.find(item => item.id === id);
      if (!doctor) throw new Error('Doctor not found.');
      return demoSchedule(doctor);
    },
    'Doctor details retrieved'
  ),
};
