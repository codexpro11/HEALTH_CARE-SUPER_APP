import { apiClient, executeWithFallback } from './axios';
import { readEmergencyState, saveEmergencyState } from '../lib/emergencyDemo';
import type { ApiResponse, AppNotification } from '../types';

export const notificationApi = {
  getNotifications: (): Promise<ApiResponse<AppNotification[]>> => executeWithFallback(
    () => apiClient.get('/api/v1/notifications'), () => readEmergencyState().notifications),
  markAsRead: (id: string): Promise<ApiResponse<AppNotification>> => executeWithFallback(
    () => apiClient.patch('/api/v1/notifications/' + encodeURIComponent(id) + '/read'), () => {
      const state = readEmergencyState();
      const item = state.notifications.find(item => item.id === id);
      if (!item) throw new Error('Notification unavailable for this account.');
      const updated = { ...item, read: true };
      saveEmergencyState({ ...state, notifications: state.notifications.map(item => item.id === id ? updated : item) });
      return updated;
    }),
  markAllAsRead: (): Promise<ApiResponse<{ updatedCount: number }>> => executeWithFallback(
    () => apiClient.post('/api/v1/notifications/mark-all-read'), () => {
      const state = readEmergencyState();
      const updatedCount = state.notifications.filter(item => !item.read).length;
      saveEmergencyState({ ...state, notifications: state.notifications.map(item => ({ ...item, read: true })) });
      return { updatedCount };
    }),
};
