import { demoStorageKey } from '../lib/demo';
import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, AppNotification } from '../types';
import { mockNotifications } from '../data/mockData';

const NOTIFS_STORAGE_KEY = 'hc_user_notifications';

function getStoredNotifications(): AppNotification[] {
  try {
    const saved = localStorage.getItem(demoStorageKey(NOTIFS_STORAGE_KEY));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return mockNotifications;
}

function saveNotifications(items: AppNotification[]) {
  try {
    localStorage.setItem(demoStorageKey(NOTIFS_STORAGE_KEY), JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse<AppNotification[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/notifications'),
      () => getStoredNotifications(),
      'Notifications retrieved'
    );
  },

  markAsRead: async (id: string): Promise<ApiResponse<AppNotification>> => {
    return executeWithFallback(
      () => apiClient.patch(`/api/v1/notifications/${id}/read`),
      () => {
        const list = getStoredNotifications();
        const found = list.find((n) => n.id === id);
        if (found) {
          found.read = true;
          saveNotifications(list);
          return found;
        }
        throw new Error('Notification not found');
      },
      'Marked as read'
    );
  },

  markAllAsRead: async (): Promise<ApiResponse<{ updatedCount: number }>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/notifications/mark-all-read'),
      () => {
        const list = getStoredNotifications();
        list.forEach((n) => (n.read = true));
        saveNotifications(list);
        return { updatedCount: list.length };
      },
      'All notifications marked as read'
    );
  },
};
