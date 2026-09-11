import axios from 'axios';

const API_BASE = '/api/v1/consents';

export interface Consent {
  id: string;
  provider: string;
  facility: string;
  scopes: string[];
  dateGranted: string;
  expiry: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export const consentApi = {
  getConsents: async (): Promise<Consent[]> => {
    // const response = await axios.get(API_BASE);
    // return response.data;
    return [
      {
        id: 'c-1',
        provider: 'Dr. John Smith',
        facility: 'Central City Hospital',
        scopes: ['Medical Summary', 'Prescriptions', 'Diagnostic Reports'],
        dateGranted: '2026-09-01',
        expiry: '2027-09-01',
        status: 'ACTIVE',
      },
      {
        id: 'c-2',
        provider: 'Emergency Access',
        facility: 'MetroCare Emergency Response',
        scopes: ['Critical Allergies', 'Blood Group', 'Current Medications', 'Emergency Contacts'],
        dateGranted: '2026-08-15',
        expiry: 'PERMANENT',
        status: 'ACTIVE',
      }
    ];
  },

  grantConsent: async (data: Partial<Consent>): Promise<Consent> => {
    // const response = await axios.post(API_BASE, data);
    // return response.data;
    return { ...data, id: `c-${Date.now()}` } as Consent;
  },

  revokeConsent: async (id: string): Promise<void> => {
    // await axios.delete(`${API_BASE}/${id}`);
    return Promise.resolve();
  }
};
