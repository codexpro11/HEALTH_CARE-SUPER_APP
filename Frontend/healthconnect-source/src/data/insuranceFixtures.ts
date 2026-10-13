import type { InsurancePolicy, InsuranceClaim } from '../lib/insuranceRules';

export function insuranceFixtures(ownerId: string) {
  const policy: InsurancePolicy = {
    id: 'pol-1234', ownerId, provider: 'SecureHealth Insurance', plan: 'Comprehensive Family Care',
    policyNumber: 'XXXX-XXXX-9482', memberId: 'MEM-XXXX-712', coverage: 500000, currency: 'USD',
    status: 'ACTIVE', startDate: '2024-06-01', endDate: '2027-05-31', createdAt: '2024-06-01T00:00:00Z', documents: [],
    coverages: [
      { name: 'In-Patient Hospitalization', limit: 'Up to Sum Insured', description: 'Sample room rent, ICU, nursing and surgeon cover.' },
      { name: 'Room Rent Limit', limit: 'Single Private Room', description: 'Sample limit of 1% of sum insured per day.' },
      { name: 'ICU Charges', limit: 'No Limit', description: 'Sample actual expenses cover.' },
      { name: 'Pre & Post Hospitalization', limit: '60 Days / 90 Days', description: 'Sample expenses before and after admission.' },
      { name: 'Day Care Procedures', limit: 'All Procedures', description: 'Sample treatments under 24 hours.' },
      { name: 'Ambulance Cover', limit: '$500 per hospitalization', description: 'Sample road ambulance cover.' },
    ],
  };
  const claims: InsuranceClaim[] = [
    { id: 'CLM-98213', hospital: 'Central City Hospital', date: '2026-08-15', amount: 4500, approvedAmount: 4500, status: 'APPROVED', type: 'Cashless' },
    { id: 'CLM-98401', hospital: 'Wellness Clinic', date: '2026-09-02', amount: 320, approvedAmount: 0, status: 'UNDER_REVIEW', type: 'Reimbursement' },
    { id: 'CLM-97102', hospital: 'MetroCare Diagnostics', date: '2026-05-10', amount: 850, approvedAmount: 600, status: 'PARTIALLY_APPROVED', type: 'Reimbursement' },
  ].map(item => ({ ...item, status: item.status as InsuranceClaim['status'], type: item.type as InsuranceClaim['type'],
    ownerId, policyId: policy.id, description: 'Sample healthcare claim for the insurance demo.', rejectionReason: '',
    documents: [], createdAt: item.date + 'T00:00:00Z',
    history: [{ status: item.status as InsuranceClaim['status'], at: item.date + 'T00:00:00Z', note: 'Imported sample claim status.' }],
  }));
  return { version: 1 as const, policies: [policy], claims };
}
