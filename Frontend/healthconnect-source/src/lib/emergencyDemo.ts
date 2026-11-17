import type { AppNotification, EmergencyRequest } from '../types';
import { getDemoSession, writeStored } from './demo';
import { activeEmergency, validateSos, type SosInput } from './emergencyRules';

export const emergencyChangeEvent = 'hc-emergency-notifications-changed';
export interface EmergencyDemoState {
  version: 1;
  emergencies: EmergencyRequest[];
  notifications: AppNotification[];
  browserAlerts: boolean;
}
export function emergencyOwner() {
  const user = getDemoSession();
  if (!user || user.role !== 'PATIENT') throw new Error('Sign in as a patient to access emergency requests and notifications.');
  return user;
}
export function emergencyKey() { return 'hc_phase5:' + emergencyOwner().id; }
export function readEmergencyState(): EmergencyDemoState {
  const owner = emergencyOwner();
  const raw = localStorage.getItem(emergencyKey());
  if (raw === null) return { version: 1, emergencies: [], notifications: [], browserAlerts: false };
  try {
    const state = JSON.parse(raw) as EmergencyDemoState;
    if (state.version !== 1 || !Array.isArray(state.emergencies) || !Array.isArray(state.notifications) || typeof state.browserAlerts !== 'boolean') throw new Error();
    if (state.emergencies.some(item => !item || item.patientId !== owner.id || !item.id || !['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED', 'CANCELLED'].includes(item.status))) throw new Error();
    if (state.notifications.some(item => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.message !== 'string' || typeof item.type !== 'string' || typeof item.read !== 'boolean' || !Number.isFinite(Date.parse(item.createdAt)))) throw new Error();
    return state;
  } catch { throw new Error('Saved emergency data could not be read. Existing data has been preserved.'); }
}
export function saveEmergencyState(state: EmergencyDemoState) {
  const owner = emergencyOwner().id;
  writeStored(emergencyKey(), state);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(emergencyChangeEvent, { detail: owner }));
}
function eventFor(request: EmergencyRequest, cancelled = false): AppNotification {
  return {
    id: 'event:' + request.id + (cancelled ? ':cancelled' : ':created'),
    type: cancelled ? 'EmergencyRequestCancelled' : 'EmergencyRequestCreated',
    title: cancelled ? 'Demo SOS cancelled' : 'Demo SOS request saved',
    message: cancelled ? 'Your local request was cancelled. No emergency service or contact was notified.' : 'Your request is pending in this demo. No ambulance, hospital or contact was notified.',
    read: false, createdAt: new Date().toISOString(), actionUrl: '/app/emergency',
  };
}
export function createDemoSos(input: SosInput): EmergencyRequest {
  const owner = emergencyOwner();
  const invalid = validateSos(input);
  if (invalid) throw new Error(invalid);
  const state = readEmergencyState();
  const previous = state.emergencies.find(item => item.clientRequestId === input.clientRequestId);
  if (previous) return previous;
  const active = state.emergencies.find(activeEmergency);
  if (active) return active;
  const request: EmergencyRequest = {
    id: 'emg-' + crypto.randomUUID(), clientRequestId: input.clientRequestId,
    patientId: owner.id, patientName: owner.fullName, patientPhone: owner.phoneNumber,
    emergencyType: input.emergencyType, address: input.address.trim(),
    latitude: input.locationSource === 'GPS' ? input.latitude : undefined,
    longitude: input.locationSource === 'GPS' ? input.longitude : undefined,
    accuracyMeters: input.locationSource === 'GPS' ? input.accuracyMeters : undefined,
    locationCapturedAt: input.locationSource === 'GPS' ? input.locationCapturedAt : undefined,
    locationSource: input.locationSource, status: 'PENDING', nearbyHospitals: [],
    createdAt: new Date().toISOString(),
  };
  // Commit the request and inbox event together, including on storage failure.
  saveEmergencyState({ ...state, emergencies: [request, ...state.emergencies], notifications: [eventFor(request), ...state.notifications] });
  return request;
}
export function cancelDemoSos(id: string, reason: string) {
  const state = readEmergencyState();
  const request = state.emergencies.find(item => item.id === id);
  if (!request) throw new Error('Emergency request unavailable for this account.');
  if (request.status === 'CANCELLED') return;
  if (request.status !== 'PENDING') throw new Error('This request cannot be cancelled here. Contact the emergency service.');
  if (reason.trim().length < 3 || reason.length > 200) throw new Error('Enter a cancellation reason of 3-200 characters.');
  const updated: EmergencyRequest = { ...request, status: 'CANCELLED', cancelledAt: new Date().toISOString(), cancellationReason: reason.trim() };
  saveEmergencyState({ ...state, emergencies: state.emergencies.map(item => item.id === id ? updated : item), notifications: [eventFor(updated, true), ...state.notifications] });
}
