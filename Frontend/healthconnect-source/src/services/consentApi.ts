import { getNfcState, revokeConsent, updateConsent, type DemoConsent } from '../lib/nfcDemo';
export type Consent = DemoConsent;
export const consentApi = {
  getConsents: async (): Promise<Consent[]> => getNfcState().consents,
  grantConsent: async (data: Partial<Consent>): Promise<Consent> => {
    if (!data.id || !data.scopes || !data.expiry) throw new Error('Select a provider, scope and expiry.');
    updateConsent(data.id, data.scopes, data.expiry);
    return getNfcState().consents.find(item => item.id === data.id)!;
  },
  revokeConsent: async (id: string): Promise<void> => revokeConsent(id),
};
