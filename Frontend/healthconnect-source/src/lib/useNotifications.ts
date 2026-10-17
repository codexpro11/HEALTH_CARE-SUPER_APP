import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../auth/AuthContext';
import { isDemoMode } from './demo';

export function useNotifications() {
  const { user, role } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: notificationApi.getNotifications,
    enabled: !!user && role === 'PATIENT',
    refetchInterval: isDemoMode ? false : 15000,
  });
}
