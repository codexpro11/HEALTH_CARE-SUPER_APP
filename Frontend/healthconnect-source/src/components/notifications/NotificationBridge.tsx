import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { useNotifications } from '../../lib/useNotifications';
import { emergencyChangeEvent, readEmergencyState } from '../../lib/emergencyDemo';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { isDemoMode } from '../../lib/demo';

export function NotificationBridge() {
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useNotifications();
  const seen = useRef<{ owner: string; ids: Set<string> } | null>(null);
  useEffect(() => {
    if (!user) return;
    const owner = user.id;
    seen.current = null;
    void useEmergencyStore.getState().restore(owner);
    const invalidate = () => {
      void client.invalidateQueries({ queryKey: ['notifications', owner] });
      void client.invalidateQueries({ queryKey: ['emergency-history', owner] });
    };
    const onChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail === owner) invalidate();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'hc_phase5:' + owner || event.key === null) {
        invalidate();
        if (!useEmergencyStore.getState().busy) void useEmergencyStore.getState().restore(owner);
      }
      if (event.key === 'hc_demo_session') {
        // A second tab changed identity. Remount authentication before showing data.
        useEmergencyStore.getState().reset();
        window.location.reload();
      }
    };
    window.addEventListener(emergencyChangeEvent, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(emergencyChangeEvent, onChange);
      window.removeEventListener('storage', onStorage);
      useEmergencyStore.getState().reset();
      seen.current = null;
    };
  }, [user?.id, client]);
  useEffect(() => {
    if (!user || !query.data) return;
    const items = query.data.data;
    const current = { owner: user.id, ids: new Set(items.map(item => item.id)) };
    const previous = seen.current;
    seen.current = current;
    if (!previous || previous.owner !== user.id || !isDemoMode) return;
    try {
      if (!readEmergencyState().browserAlerts || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const fresh = items.filter(item => !item.read && !previous.ids.has(item.id));
      // Generic lock-screen copy contains no health, identity or location details.
      if (fresh.length) new Notification('HealthConnect', { body: 'You have a new update. Open your notification inbox.', tag: 'healthconnect-update' });
    } catch { /* Inbox delivery is independent of the browser alert capability. */ }
  }, [query.data, user?.id]);
  return null;
}
