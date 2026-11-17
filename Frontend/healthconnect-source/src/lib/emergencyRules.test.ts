import test from 'node:test';
import assert from 'node:assert/strict';
import { activeEmergency, filterNotifications, safeNotificationRoute, validateSos, type SosInput } from './emergencyRules';
import { cancelDemoSos, createDemoSos, emergencyKey, readEmergencyState } from './emergencyDemo';
import { clearDemoSession, demoUser, saveDemoSession } from './demo';

const input: SosInput = { clientRequestId: 'request-001', emergencyType: 'Medical assistance', address: '123 Sample Road, Pune', locationSource: 'MANUAL' };
function storage() {
  const entries = new Map<string, string>();
  return { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); }, removeItem: (key: string) => { entries.delete(key); } };
}
function setup() {
  Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: storage(), configurable: true });
  saveDemoSession(demoUser('phase5.rules@example.test'));
}
test('manual location requires an explicit landmark, never fictional coordinates', () => {
  assert.equal(validateSos(input), null);
  assert.ok(validateSos({ ...input, address: 'Pune' }));
  assert.ok(validateSos({ ...input, emergencyType: 'invented condition' }));
  assert.ok(validateSos({ ...input, locationSource: 'OTHER' as 'GPS' }));
  setup();
  const request = createDemoSos({ ...input, latitude: 12, longitude: 30 });
  assert.equal(request.latitude, undefined);
  assert.equal(request.longitude, undefined);
  assert.equal(request.status, 'PENDING');
  assert.equal(request.ambulance, undefined);
  assert.equal(request.etaMinutes, undefined);
});
test('GPS requires finite bounded coordinates, accuracy and a recent capture', () => {
  const now = Date.now();
  const gps = { ...input, locationSource: 'GPS' as const, latitude: 0, longitude: 0, accuracyMeters: 20, locationCapturedAt: new Date(now).toISOString() };
  assert.equal(validateSos(gps, now), null);
  for (const change of [{ latitude: NaN }, { latitude: 91 }, { longitude: -181 }, { longitude: undefined }, { accuracyMeters: -1 }, { locationCapturedAt: 'invalid' }, { locationCapturedAt: new Date(now - 120001).toISOString() }, { locationCapturedAt: new Date(now + 11000).toISOString() }]) assert.ok(validateSos({ ...gps, ...change }, now));
});
test('request and event persist together; repeated and active requests do not duplicate', () => {
  setup();
  const first = createDemoSos(input);
  assert.equal(createDemoSos(input).id, first.id);
  assert.equal(createDemoSos({ ...input, clientRequestId: 'different-key' }).id, first.id);
  const state = readEmergencyState();
  assert.equal(state.emergencies.length, 1);
  assert.equal(state.notifications.length, 1);
  assert.equal(state.notifications[0].read, false);
  assert.equal(state.emergencies[0].patientId, demoUser('phase5.rules@example.test').id);
  assert.equal(activeEmergency(first), true);
});
test('cancellation preserves history, creates one event, and checks ownership and transitions', () => {
  setup();
  const first = createDemoSos(input);
  assert.throws(() => cancelDemoSos(first.id, ''), /reason/);
  assert.equal(readEmergencyState().emergencies[0].status, 'PENDING');
  cancelDemoSos(first.id, 'Created in error');
  cancelDemoSos(first.id, 'Created in error');
  const state = readEmergencyState();
  assert.equal(state.emergencies[0].status, 'CANCELLED');
  assert.ok(state.emergencies[0].cancelledAt);
  assert.equal(activeEmergency(state.emergencies[0]), false);
  assert.equal(state.notifications.length, 2);
  assert.equal(createDemoSos({ ...input, clientRequestId: 'new-request' }).status, 'PENDING');
  const changed = readEmergencyState();
  changed.emergencies[0].status = 'DISPATCHED';
  localStorage.setItem(emergencyKey(), JSON.stringify(changed));
  assert.throws(() => cancelDemoSos(changed.emergencies[0].id, 'Created in error'), /cannot be cancelled/);
});
test('patients cannot see or cancel another account request; guests and provider roles fail', () => {
  setup();
  const first = createDemoSos(input);
  saveDemoSession(demoUser('other@example.test'));
  assert.deepEqual(readEmergencyState().emergencies, []);
  assert.deepEqual(readEmergencyState().notifications, []);
  assert.throws(() => cancelDemoSos(first.id, 'Created in error'), /unavailable/);
  saveDemoSession({ ...demoUser('other@example.test'), role: 'DOCTOR' });
  assert.throws(readEmergencyState, /patient/);
  assert.throws(() => createDemoSos(input), /patient/);
  clearDemoSession();
  assert.throws(readEmergencyState, /patient/);
});
test('failed storage write creates neither a request nor an inbox event', () => {
  setup();
  const original = localStorage;
  Object.defineProperty(globalThis, 'localStorage', { value: { ...original, setItem() { throw new Error('quota'); } }, configurable: true });
  assert.throws(() => createDemoSos(input), /could not be saved/);
  assert.equal(readEmergencyState().emergencies.length, 0);
  Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true });
  const first = createDemoSos(input);
  Object.defineProperty(globalThis, 'localStorage', { value: { ...original, setItem() { throw new Error('quota'); } }, configurable: true });
  assert.throws(() => cancelDemoSos(first.id, 'Created in error'), /could not be saved/);
  assert.equal(readEmergencyState().emergencies[0].status, 'PENDING');
  assert.equal(readEmergencyState().notifications.length, 1);
});
test('corrupt stored data and cross-owner records are preserved and rejected', () => {
  setup();
  const key = emergencyKey();
  localStorage.setItem(key, '{bad');
  assert.throws(readEmergencyState, /preserved/);
  assert.equal(localStorage.getItem(key), '{bad');
  localStorage.removeItem(key);
  createDemoSos(input);
  const state = readEmergencyState();
  state.emergencies[0].patientId = 'another-account';
  localStorage.setItem(key, JSON.stringify(state));
  assert.throws(readEmergencyState, /preserved/);
});
test('inbox filters and sorting combine; only application-owned links are allowed', () => {
  setup();
  const first = createDemoSos(input);
  cancelDemoSos(first.id, 'Created in error');
  const items = readEmergencyState().notifications;
  items[0].read = true;
  assert.equal(filterNotifications(items, true, 'EMERGENCY', 'saved').length, 1);
  assert.equal(filterNotifications(items, true, 'OTHER', '').length, 0);
  assert.equal(filterNotifications(items, false, 'ALL', 'cancelled').length, 1);
  assert.equal(safeNotificationRoute('/app/emergency'), '/app/emergency');
  for (const url of ['https://evil.example', '//evil.example', 'javascript:alert(1)', '/provider/dashboard', '/app/emergency/../../profile', '/app/orders?redirect=https://evil.example']) assert.equal(safeNotificationRoute(url), null);
});
