import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeNfc, homeForRole, NfcAccessDenied, type NfcAuthorizationInput } from './nfcAuthorization';

const input: NfcAuthorizationInput = {
  authenticated: true, role: 'DOCTOR', providerId: 'provider-1', hospitalId: 'hospital-central',
  membershipActive: true, payload: 'HC-NFC:test', now: Date.parse('2026-10-10'),
  credential: { id: 'HC-NFC:test', status: 'ACTIVE', expiresAt: '2027-10-10' },
  consent: { providerId: 'provider-1', hospitalId: 'hospital-central', status: 'ACTIVE',
    expiry: '2027-10-10', scopes: ['Basic Profile', 'Medical Summary'] },
};

test('standard access returns only patient-consented scopes', () => {
  assert.deepEqual(authorizeNfc(input), ['Basic Profile', 'Medical Summary']);
  assert.deepEqual(authorizeNfc({ ...input, consent: { ...input.consent!, scopes: ['Basic Profile', 'Unknown Scope'] } }), ['Basic Profile']);
});

const denied: [string, Partial<NfcAuthorizationInput>, string][] = [
  ['anonymous actor', { authenticated: false }, 'UNAUTHENTICATED'],
  ['patient role', { role: 'PATIENT' }, 'ROLE_DENIED'],
  ['pharmacy role', { role: 'PHARMACY' }, 'ROLE_DENIED'],
  ['wrong hospital', { hospitalId: 'hospital-wellness' }, 'FACILITY_DENIED'],
  ['wrong provider', { providerId: 'provider-2' }, 'FACILITY_DENIED'],
  ['unlinked provider', { membershipActive: false }, 'FACILITY_DENIED'],
  ['replaced or unknown card', { payload: 'HC-NFC:old' }, 'UNKNOWN_CARD'],
  ['revoked card', { credential: { ...input.credential, status: 'REVOKED' } }, 'CARD_REVOKED'],
  ['expired card', { credential: { ...input.credential, expiresAt: '2026-01-01' } }, 'CARD_EXPIRED'],
  ['invalid card expiry', { credential: { ...input.credential, expiresAt: 'invalid' } }, 'CARD_EXPIRED'],
  ['missing consent', { consent: undefined }, 'CONSENT_DENIED'],
  ['revoked consent', { consent: { ...input.consent!, status: 'REVOKED' } }, 'CONSENT_DENIED'],
  ['consent for another provider', { consent: { ...input.consent!, providerId: 'provider-2' } }, 'CONSENT_DENIED'],
  ['consent for another hospital', { consent: { ...input.consent!, hospitalId: 'hospital-wellness' } }, 'CONSENT_DENIED'],
  ['expired consent', { consent: { ...input.consent!, expiry: '2026-01-01' } }, 'CONSENT_EXPIRED'],
  ['missing profile scope', { consent: { ...input.consent!, scopes: ['Insurance'] } }, 'SCOPE_DENIED'],
];
for (const [name, patch, code] of denied) test('deny ' + name, () => {
  assert.throws(() => authorizeNfc({ ...input, ...patch }), failure => failure instanceof NfcAccessDenied && failure.code === code);
});

test('emergency access requires a reason and excludes insurance and full records', () => {
  assert.throws(() => authorizeNfc({ ...input, emergency: true, reason: '' }), NfcAccessDenied);
  assert.throws(() => authorizeNfc({ ...input, emergency: true, reason: 'Short' }), NfcAccessDenied);
  const scopes = authorizeNfc({ ...input, consent: undefined, emergency: true, reason: 'Unconscious demo patient' });
  assert.ok(scopes.includes('Critical Allergies'));
  assert.equal(scopes.includes('Insurance'), false);
  assert.equal(scopes.includes('Medical Summary'), false);
  assert.throws(() => authorizeNfc({ ...input, emergency: true, reason: 'Valid emergency reason', credential: { ...input.credential, status: 'REVOKED' } }), NfcAccessDenied);
});

test('role home never routes unsupported or provider roles into patient data', () => {
  assert.equal(homeForRole('PATIENT'), '/app/dashboard');
  for (const role of ['DOCTOR', 'HOSPITAL', 'ADMIN']) assert.equal(homeForRole(role), '/provider/nfc-scanner');
  for (const role of ['PHARMACY', 'BLOOD_BANK', 'unknown']) assert.equal(homeForRole(role), '/workspace');
});
