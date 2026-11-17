import type { AppNotification, EmergencyRequest } from '../types';

export const emergencyTypes = ['Medical assistance', 'Breathing difficulty', 'Accident or injury', 'Unconscious person', 'Other emergency'] as const;
export interface SosInput {
  clientRequestId: string;
  emergencyType: string;
  address: string;
  locationSource: 'GPS' | 'MANUAL';
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  locationCapturedAt?: string;
}
export function validateSos(input: SosInput, now = Date.now()): string | null {
  if (!input.clientRequestId || input.clientRequestId.length > 100) return 'Request reference is missing. Reopen the form.';
  if (!emergencyTypes.includes(input.emergencyType as typeof emergencyTypes[number])) return 'Select an emergency type.';
  if (input.address.trim().length < 10 || input.address.length > 500) return 'Enter a location or landmark of 10-500 characters.';
  if (!['GPS', 'MANUAL'].includes(input.locationSource)) return 'Choose a location method.';
  if (input.locationSource === 'GPS') {
    if (!Number.isFinite(input.latitude) || Math.abs(input.latitude!) > 90 || !Number.isFinite(input.longitude) || Math.abs(input.longitude!) > 180) return 'Capture a valid device location or use a manual location.';
    if (!Number.isFinite(input.accuracyMeters) || input.accuracyMeters! < 0) return 'Location accuracy is unavailable. Retry or use a manual location.';
    const captured = Date.parse(input.locationCapturedAt ?? '');
    if (!Number.isFinite(captured) || now - captured > 120_000 || captured - now > 10_000) return 'Device location expired. Capture it again or use a manual location.';
  }
  return null;
}
export function activeEmergency(request: EmergencyRequest): boolean {
  return ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'].includes(request.status);
}
export function safeNotificationRoute(url?: string): string | null {
  return url && /^\/app\/(emergency|appointments|diagnostics|orders|medical-records|prescriptions|insurance)(\/[A-Za-z0-9_-]+)*$/.test(url) ? url : null;
}
export function filterNotifications(items: AppNotification[], unread: boolean, category: string, query: string) {
  const needle = query.trim().toLowerCase();
  return items.filter(item => (!unread || !item.read)
    && (category === 'ALL' || (category === 'EMERGENCY' ? item.type.startsWith('Emergency') : !item.type.startsWith('Emergency')))
    && (!needle || (item.title + ' ' + item.message).toLowerCase().includes(needle)))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
