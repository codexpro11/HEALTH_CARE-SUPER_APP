import axios from 'axios';

const API_BASE = '/api/v1/insurance';

export interface InsurancePolicy {
  id: string;
  provider: string;
  plan: string;
  policyNumber: string;
  memberId: string;
  coverage: number;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate: string;
}

export interface InsuranceClaim {
  id: string;
  hospital: string;
  amount: number;
  approvedAmount: number;
  date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'SETTLED';
  type: 'Cashless' | 'Reimbursement';
}

export const insuranceApi = {
  getPolicies: async (): Promise<InsurancePolicy[]> => {
    // const response = await axios.get(`${API_BASE}/policies`);
    // return response.data;
    return [
      {
        id: 'pol-1234',
        provider: 'SecureHealth Insurance',
        plan: 'Comprehensive Family Care',
        policyNumber: 'XXXX-XXXX-9482',
        memberId: 'MEM-XXXX-712',
        coverage: 500000,
        status: 'ACTIVE',
        startDate: '2024-06-01',
        endDate: '2027-05-31',
      }
    ];
  },

  getPolicyDetails: async (id: string): Promise<InsurancePolicy> => {
    // const response = await axios.get(`${API_BASE}/policies/${id}`);
    // return response.data;
    return {
      id: 'pol-1234',
      provider: 'SecureHealth Insurance',
      plan: 'Comprehensive Family Care',
      policyNumber: 'XXXX-XXXX-9482',
      memberId: 'MEM-XXXX-712',
      coverage: 500000,
      status: 'ACTIVE',
      startDate: '2024-06-01',
      endDate: '2027-05-31',
    };
  },

  addPolicy: async (data: Partial<InsurancePolicy>): Promise<InsurancePolicy> => {
    // const response = await axios.post(`${API_BASE}/policies`, data);
    // return response.data;
    return { ...data, id: `pol-${Date.now()}` } as InsurancePolicy;
  },

  getClaims: async (): Promise<InsuranceClaim[]> => {
    // const response = await axios.get(`${API_BASE}/claims`);
    // return response.data;
    return [
      {
        id: 'CLM-98213',
        hospital: 'Central City Hospital',
        date: '2026-08-15',
        amount: 4500,
        approvedAmount: 4500,
        status: 'APPROVED',
        type: 'Cashless'
      },
      {
        id: 'CLM-98401',
        hospital: 'Wellness Clinic',
        date: '2026-09-02',
        amount: 320,
        approvedAmount: 0,
        status: 'UNDER_REVIEW',
        type: 'Reimbursement'
      }
    ];
  },

  submitClaim: async (data: Partial<InsuranceClaim>): Promise<InsuranceClaim> => {
    // const response = await axios.post(`${API_BASE}/claims`, data);
    // return response.data;
    return { ...data, id: `CLM-${Date.now()}` } as InsuranceClaim;
  }
};
