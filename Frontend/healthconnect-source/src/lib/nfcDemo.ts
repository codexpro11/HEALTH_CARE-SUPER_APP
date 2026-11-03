import { getDemoSession, isDemoMode, readStored, writeStored } from './demo';
import { authorizeNfc, homeForRole, isProviderRole, NfcAccessDenied, REGULAR_SCOPES } from './nfcAuthorization';
export { homeForRole, isProviderRole, NfcAccessDenied, REGULAR_SCOPES };

export interface DemoCredential {
  id: string;
  patientId: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  issuedAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
}
export interface DemoConsent {
  id: string;
  providerId: string;
  hospitalId: string;
  provider: string;
  facility: string;
  scopes: string[];
  dateGranted: string;
  expiry: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}
export interface DemoAudit {
  id: string;
  timestamp: string;
  accessType: 'STANDARD' | 'EMERGENCY';
  outcome: 'GRANTED' | 'DENIED';
  reason: string;
  scopes: string[];
}
interface DemoNfcState {
  version: 1;
  credentials: DemoCredential[];
  consents: DemoConsent[];
  history: DemoAudit[];
  revision: number;
}
export interface DemoGrant {
  accountId: string;
  patientId: string;
  credentialId: string;
  role: string;
  revision: number;
  scopes: string[];
  emergency: boolean;
  expiresAt: number;
}
export const NFC_CHANGED = 'hc:nfc-changed';

function actor() {
  if (!isDemoMode) throw new Error('This NFC demo is unavailable outside demo mode.');
  const session = getDemoSession();
  if (!session) throw new NfcAccessDenied('UNAUTHENTICATED', 'Sign in before using NFC.');
  return session;
}
function key() { return 'hc_nfc:' + actor().id; }
function accessKey() { return 'hc_nfc_access:' + actor().id; }
function makeCredential(): DemoCredential {
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);
  return { id: 'HC-NFC:' + crypto.randomUUID(), patientId: 'PT-1002', status: 'ACTIVE',
    issuedAt: now.toISOString(), expiresAt: end.toISOString(), lastUsedAt: null };
}
function initialState(): DemoNfcState {
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);
  return { version: 1, credentials: [makeCredential()], revision: 0, history: [], consents: [
    { id: 'c-1', providerId: 'provider-1', hospitalId: 'hospital-central', provider: 'Dr. John Smith',
      facility: 'Central City Hospital', scopes: [...REGULAR_SCOPES], dateGranted: now.toISOString().slice(0, 10),
      expiry: end.toISOString().slice(0, 10), status: 'ACTIVE' },
    { id: 'c-3', providerId: 'provider-2', hospitalId: 'hospital-wellness', provider: 'Dr. Sarah Connor',
      facility: 'Wellness Clinic', scopes: ['Basic Profile', 'Medical Summary', 'Diagnostic Reports'],
      dateGranted: '2025-01-10', expiry: '2026-01-10', status: 'EXPIRED' },
  ] };
}
export function getNfcState(): DemoNfcState {
  const saved = readStored<DemoNfcState | null>(key(), null);
  if (saved?.version === 1 && Array.isArray(saved.credentials) && Array.isArray(saved.consents)) return saved;
  const state = initialState();
  writeStored(key(), state);
  return state;
}
function save(state: DemoNfcState) {
  writeStored(key(), state);
  window.dispatchEvent(new Event(NFC_CHANGED));
}
function requirePatient() {
  if (actor().role !== 'PATIENT') throw new NfcAccessDenied('ROLE_DENIED', 'Only the patient persona can manage cards or consent.');
}
export function currentCredential() {
  return getNfcState().credentials[0];
}
export function maskedCredential(id: string) {
  return 'HC-' + id.slice(7, 11).toUpperCase() + '-••••-' + id.slice(-4).toUpperCase();
}
export function issueCredential() {
  requirePatient();
  const state = getNfcState();
  const credential = makeCredential();
  const credentials = state.credentials.map(card => ({ ...card, status: card.status === 'ACTIVE' ? 'REVOKED' as const : card.status }));
  save({ ...state, credentials: [credential, ...credentials], revision: state.revision + 1 });
  clearNfcAccess();
  return credential;
}
export function revokeCredential(id: string) {
  requirePatient();
  const state = getNfcState();
  if (!state.credentials.some(card => card.id === id)) throw new Error('Card not found.');
  save({ ...state, credentials: state.credentials.map(card => card.id === id ? { ...card, status: 'REVOKED' } : card),
    revision: state.revision + 1 });
  clearNfcAccess();
}
export function updateConsent(id: string, scopes: string[], expiry: string) {
  requirePatient();
  if (!scopes.includes('Basic Profile')) throw new Error('Include Basic Profile when granting access.');
  if (Date.parse(expiry) <= Date.now() || !Number.isFinite(Date.parse(expiry))) throw new Error('Choose a future consent expiry.');
  const state = getNfcState();
  if (!state.consents.some(consent => consent.id === id)) throw new Error('Consent not found.');
  save({ ...state, revision: state.revision + 1, consents: state.consents.map(consent => consent.id === id ? {
    ...consent, scopes: scopes.filter(scope => REGULAR_SCOPES.includes(scope)), expiry,
    dateGranted: new Date().toISOString().slice(0, 10), status: 'ACTIVE',
  } : consent) });
  clearNfcAccess();
}
export function revokeConsent(id: string) {
  requirePatient();
  const state = getNfcState();
  if (!state.consents.some(consent => consent.id === id)) throw new Error('Consent not found.');
  save({ ...state, revision: state.revision + 1,
    consents: state.consents.map(consent => consent.id === id ? { ...consent, status: 'REVOKED' } : consent) });
  clearNfcAccess();
}
export function clearNfcAccess() {
  try {
    const session = getDemoSession();
    if (session) sessionStorage.removeItem('hc_nfc_access:' + session.id);
    window.dispatchEvent(new Event(NFC_CHANGED));
  } catch { /* A missing grant denies access. */ }
}
export function requestNfcAccess(payload: string, providerId: string, hospitalId: string,
  emergency = false, reason = '', membershipActive = true): DemoGrant {
  const session = actor();
  const state = getNfcState();
  const credential = state.credentials[0];
  const consent = state.consents.find(item => item.providerId === providerId && item.hospitalId === hospitalId);
  clearNfcAccess();
  try {
    const scopes = authorizeNfc({ authenticated: true, role: session.role, providerId, hospitalId,
      membershipActive, payload, credential, consent, emergency, reason });
    const grant: DemoGrant = { accountId: session.id, patientId: credential.patientId, credentialId: credential.id,
      role: session.role, revision: state.revision, scopes, emergency, expiresAt: Date.now() + 5 * 60 * 1000 };
    sessionStorage.setItem(accessKey(), JSON.stringify(grant));
    save({ ...state, credentials: state.credentials.map(card => card.id === credential.id ?
      { ...card, lastUsedAt: new Date().toISOString() } : card), history: [
      { id: crypto.randomUUID(), timestamp: new Date().toISOString(), accessType: emergency ? 'EMERGENCY' as const : 'STANDARD' as const,
        outcome: 'GRANTED' as const, reason: emergency ? reason.trim() : 'Patient-authorized demo scan', scopes }, ...state.history].slice(0, 50) });
    return grant;
  } catch (failure) {
    clearNfcAccess();
    save({ ...state, history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(),
      accessType: emergency ? 'EMERGENCY' as const : 'STANDARD' as const, outcome: 'DENIED' as const,
      reason: failure instanceof Error ? failure.message : 'Access denied', scopes: [] }, ...state.history].slice(0, 50) });
    throw failure;
  }
}
export function currentNfcAccess(patientId: string): DemoGrant | null {
  try {
    const session = actor();
    if (!isProviderRole(session.role)) return null;
    const raw = sessionStorage.getItem(accessKey());
    if (!raw) return null;
    const grant = JSON.parse(raw) as DemoGrant;
    const state = getNfcState();
    const card = state.credentials[0];
    if (grant.accountId !== session.id || grant.patientId !== patientId || grant.role !== session.role ||
      grant.expiresAt <= Date.now() || grant.revision !== state.revision || grant.credentialId !== card.id) return null;
    const scopes = authorizeNfc({ authenticated: true, role: session.role, providerId: 'provider-1', hospitalId: 'hospital-central',
      membershipActive: true, payload: grant.credentialId, credential: card,
      consent: state.consents.find(item => item.id === 'c-1'), emergency: grant.emergency,
      reason: grant.emergency ? 'Validated demo emergency' : undefined });
    return { ...grant, scopes };
  } catch { return null; }
}

