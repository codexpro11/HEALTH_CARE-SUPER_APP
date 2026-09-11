import axios from 'axios';

const API_BASE = '/api/v1/nfc';

export interface NfcCredential {
  id: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  issuedAt: string;
  lastUsedAt: string | null;
}

export interface NfcAccessRequest {
  nfcPayload: string;
  providerId: string;
}

export interface NfcAccessResponse {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  scopes: string[];
}

export interface NfcEmergencyAccessRequest {
  nfcPayload: string;
  providerId: string;
  reason: string;
}

export const nfcApi = {
  // Provider requesting access via NFC scan
  requestAccess: async (data: NfcAccessRequest): Promise<NfcAccessResponse> => {
    // const response = await axios.post(`${API_BASE}/access`, data);
    // return response.data;
    
    // MOCK RESPONSE
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          patientId: 'PT-1002',
          name: 'Sarah Johnson',
          age: 32,
          gender: 'Female',
          bloodGroup: 'O+',
          allergies: ['Penicillin'],
          emergencyContact: {
            name: 'Mark Johnson',
            relation: 'Husband',
            phone: '+1 555-0198'
          },
          scopes: ['Basic Profile', 'Medical Summary', 'Prescriptions', 'Diagnostic Reports', 'Insurance']
        });
      }, 1000);
    });
  },

  // Provider requesting emergency access
  requestEmergencyAccess: async (data: NfcEmergencyAccessRequest): Promise<NfcAccessResponse> => {
    // const response = await axios.post(`${API_BASE}/access/emergency`, data);
    // return response.data;
    return nfcApi.requestAccess(data);
  },

  // Patient managing their own credentials
  getMyCredentials: async (): Promise<NfcCredential[]> => {
    // const response = await axios.get(`${API_BASE}/credentials/me`);
    // return response.data;
    return [
      {
        id: 'HC-8472-••••-9123',
        status: 'ACTIVE',
        issuedAt: '2025-10-15T10:00:00Z',
        lastUsedAt: '2026-09-08T14:30:00Z',
      }
    ];
  },

  provisionCredential: async (): Promise<NfcCredential> => {
    // const response = await axios.post(`${API_BASE}/credentials`);
    // return response.data;
    return {
      id: 'HC-NEW-••••-0000',
      status: 'ACTIVE',
      issuedAt: new Date().toISOString(),
      lastUsedAt: null,
    };
  },

  revokeCredential: async (id: string): Promise<void> => {
    // await axios.post(`${API_BASE}/credentials/${id}/revoke`);
    return Promise.resolve();
  }
};
