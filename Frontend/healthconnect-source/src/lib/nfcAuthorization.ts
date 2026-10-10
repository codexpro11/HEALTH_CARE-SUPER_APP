import type { UserRole } from '../types';

export const PROVIDER_ROLES: UserRole[] = ['DOCTOR', 'HOSPITAL', 'ADMIN'];
export const REGULAR_SCOPES = ['Basic Profile', 'Medical Summary', 'Prescriptions', 'Diagnostic Reports', 'Insurance'];
export const EMERGENCY_SCOPES = ['Basic Profile', 'Blood Group', 'Critical Allergies', 'Current Medications', 'Emergency Contacts'];

export function isProviderRole(role: string): boolean {
  return PROVIDER_ROLES.includes(role as UserRole);
}

export function homeForRole(role: string): string {
  if (role === 'PATIENT') return '/app/dashboard';
  return isProviderRole(role) ? '/provider/nfc-scanner' : '/workspace';
}

export class NfcAccessDenied extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'NfcAccessDenied';
  }
}

export interface NfcAuthorizationInput {
  authenticated: boolean;
  role: string;
  providerId: string;
  hospitalId: string;
  membershipActive: boolean;
  payload: string;
  credential: { id: string; status: string; expiresAt: string };
  consent?: { providerId: string; hospitalId: string; status: string; expiry: string; scopes: string[] };
  emergency?: boolean;
  reason?: string;
  now?: number;
}

export function authorizeNfc(input: NfcAuthorizationInput): string[] {
  const deny = (code: string, message: string): never => { throw new NfcAccessDenied(code, message); };
  const now = input.now ?? Date.now();
  if (!input.authenticated) deny('UNAUTHENTICATED', 'Sign in before scanning a card.');
  if (!isProviderRole(input.role)) deny('ROLE_DENIED', 'Only a provider persona can scan patient cards.');
  if (!input.membershipActive || input.providerId !== 'provider-1' || input.hospitalId !== 'hospital-central') {
    deny('FACILITY_DENIED', 'The provider is not associated with this authorized demo hospital.');
  }
  if (input.payload !== input.credential.id) deny('UNKNOWN_CARD', 'This NFC card is unknown or has been replaced.');
  if (input.credential.status !== 'ACTIVE') deny('CARD_REVOKED', 'This NFC card has been revoked.');
  const expiry = Date.parse(input.credential.expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now) deny('CARD_EXPIRED', 'This NFC card has expired.');
  if (input.emergency) {
    if (!input.reason || input.reason.trim().length < 10) {
      deny('REASON_REQUIRED', 'Enter an emergency reason with at least 10 characters.');
    }
    return [...EMERGENCY_SCOPES];
  }
  const consent = input.consent;
  if (!consent || consent.status !== 'ACTIVE' || consent.providerId !== input.providerId || consent.hospitalId !== input.hospitalId) {
    deny('CONSENT_DENIED', 'The patient has not granted active consent to this provider and facility.');
  }
  const consentExpiry = Date.parse(consent!.expiry);
  if (!Number.isFinite(consentExpiry) || consentExpiry <= now) deny('CONSENT_EXPIRED', 'Patient consent has expired.');
  const scopes = consent!.scopes.filter(scope => REGULAR_SCOPES.includes(scope));
  if (!scopes.includes('Basic Profile')) deny('SCOPE_DENIED', 'Patient consent does not include basic profile access.');
  return scopes;
}
