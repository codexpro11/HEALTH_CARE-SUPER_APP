import { apiClient, executeWithFallback } from '../api/axios';
import type { ApiResponse } from '../types';
import { demoStorageKey, readStored, writeStored } from '../lib/demo';

const API_BASE = '/api/v1/nfc/credentials';

export interface NfcCredential {
  id: string;
  credentialId: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  issuedAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

function getDemoCredentials(): NfcCredential[] {
  return readStored<NfcCredential[]>(demoStorageKey('hc_nfc_credentials'), []);
}

function saveDemoCredentials(credentials: NfcCredential[]): void {
  writeStored(demoStorageKey('hc_nfc_credentials'), credentials);
}

export const nfcApi = {
  getMyCredentials: async (): Promise<NfcCredential[]> => {
    const response = await executeWithFallback(
      () => apiClient.get<ApiResponse<NfcCredential[]>>(`${API_BASE}/me`),
      getDemoCredentials,
      'NFC credentials fetched successfully'
    );
    return response.data;
  },

  issueCredential: async (credentialId: string): Promise<NfcCredential> => {
    const response = await executeWithFallback(
      () => apiClient.post<ApiResponse<NfcCredential>>(API_BASE, { credentialId }),
      () => {
        const credential: NfcCredential = {
          id: `demo-${Date.now()}`,
          credentialId: credentialId.replace(/[:-]/g, '').toUpperCase(),
          status: 'ACTIVE',
          issuedAt: new Date().toISOString(),
          expiresAt: null,
          lastUsedAt: null,
        };
        saveDemoCredentials([credential, ...getDemoCredentials()]);
        return credential;
      },
      'NFC card mapped successfully'
    );
    return response.data;
  },

  revokeCredential: async (id: string): Promise<NfcCredential> => {
    const response = await executeWithFallback(
      () => apiClient.post<ApiResponse<NfcCredential>>(`${API_BASE}/${encodeURIComponent(id)}/revoke`),
      () => {
        const credentials = getDemoCredentials();
        const credential = credentials.find(item => item.id === id);
        if (!credential) throw new Error('NFC credential not found');
        const revokedCredential = { ...credential, status: 'REVOKED' as const };
        saveDemoCredentials(credentials.map(item => item.id === id ? revokedCredential : item));
        return revokedCredential;
      },
      'NFC card revoked successfully'
    );
    return response.data;
  },
};
