import { apiClient, executeWithFallback } from './axios';
import { cancelDemoSos, createDemoSos, readEmergencyState } from '../lib/emergencyDemo';
import { activeEmergency, validateSos, type SosInput } from '../lib/emergencyRules';
import type { ApiResponse, EmergencyRequest } from '../types';

export const emergencyApi = {
  triggerSOS: async (data: SosInput): Promise<ApiResponse<EmergencyRequest>> => {
    const invalid = validateSos(data);
    if (invalid) throw new Error(invalid);
    return executeWithFallback(() => apiClient.post('/api/v1/emergency/sos', data, { headers: { 'Idempotency-Key': data.clientRequestId } }), () => createDemoSos(data), 'Demo request saved; no emergency services contacted');
  },
  getActiveEmergency: (): Promise<ApiResponse<EmergencyRequest | null>> => executeWithFallback(
    () => apiClient.get('/api/v1/emergency/active'), () => readEmergencyState().emergencies.find(activeEmergency) ?? null),
  getHistory: (): Promise<ApiResponse<EmergencyRequest[]>> => executeWithFallback(
    () => apiClient.get('/api/v1/emergency/history'), () => readEmergencyState().emergencies),
  cancelEmergency: (id: string, reason = 'Created in error'): Promise<ApiResponse<{ cancelled: boolean; message: string }>> => executeWithFallback(
    () => apiClient.post('/api/v1/emergency/' + encodeURIComponent(id) + '/cancel', { reason }),
    () => { cancelDemoSos(id, reason); return { cancelled: true, message: 'Local demo request cancelled' }; }),
};
