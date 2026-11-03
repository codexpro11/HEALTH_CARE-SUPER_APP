export type Currency = 'INR' | 'USD';
export type PolicyStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'SETTLED';
export interface InsuranceDocument { id: string; name: string; type: string; size: number; uploadedAt: string; }
export interface InsurancePolicy {
  id: string; ownerId: string; provider: string; plan: string; policyNumber: string; memberId: string;
  coverage: number; currency: Currency; status: PolicyStatus; startDate: string; endDate: string;
  coverages: { name: string; limit: string; description: string }[];
  documents: InsuranceDocument[]; createdAt: string;
}
export interface ClaimEvent { status: ClaimStatus; at: string; note: string; }
export interface InsuranceClaim {
  id: string; ownerId: string; policyId: string; hospital: string; amount: number; approvedAmount: number;
  date: string; status: ClaimStatus; type: 'Cashless' | 'Reimbursement'; description: string;
  rejectionReason: string; documents: InsuranceDocument[]; history: ClaimEvent[]; createdAt: string;
}
export type PolicyInput = Pick<InsurancePolicy, 'provider' | 'plan' | 'policyNumber' | 'memberId' | 'coverage' | 'currency' | 'status' | 'startDate' | 'endDate'> & { coverageNotes?: string };
export type ClaimInput = Pick<InsuranceClaim, 'policyId' | 'hospital' | 'amount' | 'date' | 'type' | 'description'>;

export function calendarDate(now = new Date()): string {
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validMoney(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= 999999999 && Math.round(value * 100) / 100 === value;
}
export function maskIdentifier(value: string): string {
  return '••••-' + value.slice(-4);
}
export function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}
export function effectivePolicyStatus(policy: Pick<InsurancePolicy, 'status' | 'startDate' | 'endDate'>, today = calendarDate()): PolicyStatus {
  if (policy.status === 'CANCELLED') return 'CANCELLED';
  if (policy.endDate < today) return 'EXPIRED';
  if (policy.startDate > today || policy.status === 'PENDING') return 'PENDING';
  return policy.status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE';
}
export function validatePolicy(input: PolicyInput): void {
  if (!input.provider.trim() || !input.plan.trim()) throw new Error('Enter the insurance provider and plan name.');
  if (input.provider.length > 120 || input.plan.length > 160) throw new Error('Use a shorter provider or plan name.');
  if (input.policyNumber.trim().length < 4 || input.memberId.trim().length < 4) throw new Error('Enter policy and member identifiers with at least four characters.');
  if (input.policyNumber.length > 100 || input.memberId.length > 100) throw new Error('Use identifiers shorter than 100 characters.');
  if (!validMoney(input.coverage)) throw new Error('Enter a positive sum insured with up to two decimal places.');
  if (!['INR', 'USD'].includes(input.currency)) throw new Error('Choose a supported currency.');
  if (!['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'].includes(input.status)) throw new Error('Choose a valid policy status.');
  if (!validDate(input.startDate) || !validDate(input.endDate) || input.endDate < input.startDate) throw new Error('Enter valid policy dates with the end on or after the start.');
  if ((input.coverageNotes?.length ?? 0) > 2000) throw new Error('Keep coverage notes within 2,000 characters.');
}
export function validateClaim(input: ClaimInput, policy: InsurancePolicy, today = calendarDate()): void {
  if (input.policyId !== policy.id) throw new Error('Select one of your insurance policies.');
  if (!input.hospital.trim() || input.hospital.length > 160) throw new Error('Enter the hospital or facility name.');
  if (!validMoney(input.amount) || input.amount > policy.coverage) throw new Error('Enter a positive claim amount within the policy sum insured.');
  if (!validDate(input.date) || input.date > today) throw new Error('Choose a valid service date that is not in the future.');
  if (input.date < policy.startDate || input.date > policy.endDate) throw new Error('The service date must fall within this policy period.');
  if (policy.status === 'CANCELLED' || policy.status === 'PENDING') throw new Error('Use an active or historically covered policy for this claim.');
  if (!['Cashless', 'Reimbursement'].includes(input.type)) throw new Error('Choose Cashless or Reimbursement.');
  if (input.description.trim().length < 10 || input.description.length > 2000) throw new Error('Describe the claim in 10 to 2,000 characters.');
}
const transitions: Record<ClaimStatus, ClaimStatus[]> = {
  DRAFT: ['SUBMITTED'], SUBMITTED: ['UNDER_REVIEW'], UNDER_REVIEW: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'],
  APPROVED: ['SETTLED'], PARTIALLY_APPROVED: ['SETTLED'], REJECTED: [], SETTLED: [],
};
export function claimDecision(claim: InsuranceClaim, status: ClaimStatus, amount?: number, reason = ''): { approvedAmount: number; rejectionReason: string } {
  if (!transitions[claim.status].includes(status)) throw new Error('This claim status transition is not allowed.');
  if (status === 'APPROVED') return { approvedAmount: claim.amount, rejectionReason: '' };
  if (status === 'PARTIALLY_APPROVED') {
    if (!validMoney(amount ?? 0) || amount! >= claim.amount) throw new Error('Partial approval must be positive and below the claimed amount.');
    return { approvedAmount: amount!, rejectionReason: '' };
  }
  if (status === 'REJECTED') {
    if (reason.trim().length < 5 || reason.length > 500) throw new Error('Enter a rejection reason of 5 to 500 characters.');
    return { approvedAmount: 0, rejectionReason: reason.trim() };
  }
  return { approvedAmount: claim.approvedAmount, rejectionReason: claim.rejectionReason };
}

