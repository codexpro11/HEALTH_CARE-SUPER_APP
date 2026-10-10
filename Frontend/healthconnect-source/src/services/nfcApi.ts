import { currentCredential, getNfcState, issueCredential, revokeCredential, requestNfcAccess } from '../lib/nfcDemo';

export interface NfcAccessRequest {
  nfcPayload: string;
  providerId: string;
  hospitalId: string;
  membershipActive?: boolean;
}
export interface NfcAccessResponse {
  patientId: string;
  scopes: string[];
  expiresAt: number;
}
export interface NfcEmergencyAccessRequest extends NfcAccessRequest { reason: string; }

export const nfcApi = {
  requestAccess: async (data: NfcAccessRequest): Promise<NfcAccessResponse> =>
    requestNfcAccess(data.nfcPayload, data.providerId, data.hospitalId, false, '', data.membershipActive ?? true),
  requestEmergencyAccess: async (data: NfcEmergencyAccessRequest): Promise<NfcAccessResponse> =>
    requestNfcAccess(data.nfcPayload, data.providerId, data.hospitalId, true, data.reason, data.membershipActive ?? true),
  getMyCredentials: async () => getNfcState().credentials,
  issueCredential: async () => issueCredential(),
  revokeCredential: async (id: string) => revokeCredential(id),
  getCurrentCredential: () => currentCredential(),
};
