import { getInsuranceState, savePolicy, saveClaim, transitionClaim, deletePolicy } from '../lib/insuranceDemo';
import type { PolicyInput, ClaimInput } from '../lib/insuranceDemo';
export type { InsurancePolicy, InsuranceClaim } from '../lib/insuranceDemo';

export const insuranceApi = {
  getPolicies: async () => getInsuranceState().policies,
  getPolicyDetails: async (id: string) => {
    const policy = getInsuranceState().policies.find(item => item.id === id);
    if (!policy) throw new Error('Policy not found in this demo account.');
    return policy;
  },
  addPolicy: async (input: PolicyInput) => savePolicy(input),
  updatePolicy: async (id: string, input: PolicyInput) => savePolicy(input, id),
  deletePolicy: async (id: string) => deletePolicy(id),
  getClaims: async () => getInsuranceState().claims,
  getClaimDetails: async (id: string) => {
    const claim = getInsuranceState().claims.find(item => item.id === id);
    if (!claim) throw new Error('Claim not found in this demo account.');
    return claim;
  },
  saveDraft: async (input: ClaimInput, id?: string) => saveClaim(input, id),
  submitClaim: async (id: string) => transitionClaim(id, 'SUBMITTED'),
};
