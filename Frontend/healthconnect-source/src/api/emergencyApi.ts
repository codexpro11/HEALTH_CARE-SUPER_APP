import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, EmergencyRequest } from '../types';

let activeEmergencySession: EmergencyRequest | null = null;

export const emergencyApi = {
  triggerSOS: async (data: {
    latitude: number;
    longitude: number;
    address: string;
    emergencyType: string;
  }): Promise<ApiResponse<EmergencyRequest>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/emergency/sos', data),
      () => {
        const session: EmergencyRequest = {
          id: `emg-${Date.now()}`,
          patientId: 'usr-patient-001',
          patientName: 'Sarah Jenkins',
          patientPhone: '+1 (555) 234-5678',
          emergencyType: data.emergencyType || 'Critical Medical Distress',
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || '742 Evergreen Terrace, Metro City',
          status: 'DISPATCHED',
          etaMinutes: 6,
          ambulance: {
            vehicleNumber: 'AMB-MED-409',
            paramedicName: 'Captain James Miller (EMT-P)',
            paramedicContact: '+1 (555) 911-4422',
            currentSpeedKmh: 68,
            assignedHospital: 'Central Metro Academic Trauma Center',
          },
          nearbyHospitals: [
            {
              id: 'hosp-01',
              name: 'Central Metro Academic Hospital',
              distanceKm: 1.8,
              emergencyBeds: 8,
              icuBeds: 14,
              phone: '+1 (555) 911-0001',
            },
            {
              id: 'hosp-02',
              name: 'St. Jude Regional Medical Center',
              distanceKm: 3.4,
              emergencyBeds: 4,
              icuBeds: 6,
              phone: '+1 (555) 911-0002',
            },
          ],
          createdAt: new Date().toISOString(),
        };
        activeEmergencySession = session;
        return session;
      },
      'Emergency SOS triggered. Emergency units have been notified.'
    );
  },

  getActiveEmergency: async (): Promise<ApiResponse<EmergencyRequest | null>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/emergency/active'),
      () => activeEmergencySession,
      'Active emergency state retrieved'
    );
  },

  cancelEmergency: async (id: string, reason?: string): Promise<ApiResponse<{ cancelled: boolean; message: string }>> => {
    return executeWithFallback(
      () => apiClient.post(`/api/v1/emergency/${id}/cancel`, { reason }),
      () => {
        activeEmergencySession = null;
        return { cancelled: true, message: 'Emergency alert canceled successfully' };
      },
      'Emergency response cancelled'
    );
  },
};
