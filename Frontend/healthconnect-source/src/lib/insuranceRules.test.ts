import test from 'node:test';
import assert from 'node:assert/strict';
import { insuranceFixtures } from '../data/insuranceFixtures';
import { validatePolicy, validateClaim, claimDecision, effectivePolicyStatus, maskIdentifier, validDate, validMoney } from './insuranceRules';
import type { PolicyInput, ClaimInput, InsuranceClaim, ClaimStatus } from './insuranceRules';

const policy = insuranceFixtures('patient-A').policies[0];
const input: PolicyInput = { ...policy };
const claim: ClaimInput = { policyId: policy.id, hospital: 'QA Hospital', amount: 5000, date: '2026-10-10', type: 'Reimbursement', description: 'Sample inpatient healthcare claim.' };
const draft: InsuranceClaim = { ...insuranceFixtures('patient-A').claims[0], ...claim, status: 'DRAFT', approvedAmount: 0 };

test('valid policy and historical service dates are accepted without inventing insurer eligibility', () => {
  assert.doesNotThrow(() => validatePolicy(input));
  assert.doesNotThrow(() => validateClaim(claim, policy, '2026-10-13'));
  assert.doesNotThrow(() => validateClaim(claim, { ...policy, status: 'EXPIRED' }, '2028-01-01'));
});
for (const [name, patch] of [
  ['blank provider', { provider: '  ' }], ['blank plan', { plan: '' }], ['short policy identifier', { policyNumber: 'ab' }],
  ['short member identifier', { memberId: '' }], ['zero sum insured', { coverage: 0 }], ['negative sum insured', { coverage: -1 }],
  ['nonfinite sum insured', { coverage: Infinity }], ['fractional cents', { coverage: 1.123 }],
  ['invalid calendar date', { startDate: '2026-02-30' }], ['end before start', { endDate: '2020-01-01' }],
  ['unknown currency', { currency: 'XYZ' }], ['unknown status', { status: 'UNKNOWN' }],
] as [string, Partial<PolicyInput>][]) test('policy rejects ' + name, () => {
  assert.throws(() => validatePolicy({ ...input, ...patch }));
});
for (const [name, patch] of [
  ['another policy ID', { policyId: 'foreign-policy' }], ['blank hospital', { hospital: ' ' }], ['zero amount', { amount: 0 }],
  ['amount above cover', { amount: policy.coverage + 1 }], ['nonfinite amount', { amount: NaN }],
  ['future service', { date: '2026-10-14' }], ['invalid service date', { date: '2026-02-30' }],
  ['outside policy period', { date: '2024-01-01' }], ['short description', { description: 'short' }],
] as [string, Partial<ClaimInput>][]) test('claim rejects ' + name, () => {
  assert.throws(() => validateClaim({ ...claim, ...patch }, policy, '2026-10-13'));
});
test('cancelled and pending policies cannot seed a claim', () => {
  for (const status of ['CANCELLED', 'PENDING'] as const) assert.throws(() => validateClaim(claim, { ...policy, status }, '2026-10-13'));
});
test('status derives correctly at policy date boundaries', () => {
  assert.equal(effectivePolicyStatus(policy, policy.startDate), 'ACTIVE');
  assert.equal(effectivePolicyStatus(policy, policy.endDate), 'ACTIVE');
  assert.equal(effectivePolicyStatus(policy, '2028-01-01'), 'EXPIRED');
  assert.equal(effectivePolicyStatus(policy, '2020-01-01'), 'PENDING');
  assert.equal(effectivePolicyStatus({ ...policy, status: 'CANCELLED' }), 'CANCELLED');
});
test('claim lifecycle permits submission, review, decision and settlement only', () => {
  let current = draft;
  for (const status of ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'SETTLED'] as ClaimStatus[]) {
    current = { ...current, ...claimDecision(current, status), status };
  }
  assert.equal(current.approvedAmount, claim.amount);
  assert.throws(() => claimDecision(current, 'DRAFT'));
  assert.throws(() => claimDecision(draft, 'APPROVED'));
  assert.throws(() => claimDecision({ ...draft, status: 'SUBMITTED' }, 'SUBMITTED'));
});
test('partial decisions and rejected terminal states have consistent amounts', () => {
  const reviewed = { ...draft, status: 'UNDER_REVIEW' as const };
  for (const amount of [0, -1, claim.amount, claim.amount + 1, NaN]) assert.throws(() => claimDecision(reviewed, 'PARTIALLY_APPROVED', amount));
  const partial = claimDecision(reviewed, 'PARTIALLY_APPROVED', 2500);
  assert.equal(partial.approvedAmount, 2500);
  assert.throws(() => claimDecision(reviewed, 'REJECTED', undefined, 'no'));
  const rejected = { ...reviewed, ...claimDecision(reviewed, 'REJECTED', undefined, 'Sample exclusion reason'), status: 'REJECTED' as const };
  assert.equal(rejected.approvedAmount, 0);
  assert.throws(() => claimDecision(rejected, 'SETTLED'));
});
test('amount validation and identifier masking do not expose full identifiers', () => {
  assert.equal(validMoney(1.01), true);
  assert.equal(validMoney(0.001), false);
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(maskIdentifier('PRIVATE-POLICY-1004'), '••••-1004');
});

