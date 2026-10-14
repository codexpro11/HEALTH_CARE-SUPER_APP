import { demoStorageKey } from '../lib/demo';
import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, MedicalRecord, Prescription, ProviderConsent, RecordType } from '../types';
import { mockMedicalRecords, mockPrescriptions, mockProviderConsents } from '../data/mockData';

const RECORDS_STORAGE_KEY = 'hc_user_records';
const CONSENTS_STORAGE_KEY = 'hc_user_consents';

function getStoredRecords(): MedicalRecord[] {
  try {
    const saved = localStorage.getItem(demoStorageKey(RECORDS_STORAGE_KEY));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return mockMedicalRecords;
}

function getStoredConsents(): ProviderConsent[] {
  try {
    const saved = localStorage.getItem(demoStorageKey(CONSENTS_STORAGE_KEY));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return mockProviderConsents;
}

export const medicalRecordApi = {
  getRecords: async (type?: RecordType | 'ALL'): Promise<ApiResponse<MedicalRecord[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/medical-records', { params: { type } }),
      () => {
        const records = getStoredRecords();
        if (!type || type === 'ALL') return records;
        return records.filter((r) => r.recordType === type);
      },
      'Medical records fetched'
    );
  },

  getRecordById: async (id: string): Promise<ApiResponse<MedicalRecord>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/medical-records/${id}`),
      () => {
        const records = getStoredRecords();
        const found = records.find((r) => r.id === id);
        if (!found) throw new Error('Record not found');
        return found;
      },
      'Record details retrieved'
    );
  },

  getPrescriptions: async (status?: 'ACTIVE' | 'COMPLETED' | 'ALL'): Promise<ApiResponse<Prescription[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/prescriptions', { params: { status } }),
      () => {
        if (!status || status === 'ALL') return mockPrescriptions;
        return mockPrescriptions.filter((p) => p.status === status);
      },
      'Prescriptions retrieved'
    );
  },

  getPrescriptionById: async (id: string): Promise<ApiResponse<Prescription>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/prescriptions/${id}`),
      () => {
        const found = mockPrescriptions.find((p) => p.id === id) || mockPrescriptions[0];
        return found;
      },
      'Prescription details retrieved'
    );
  },

  getProviderConsents: async (): Promise<ApiResponse<ProviderConsent[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/medical-records/consents'),
      () => getStoredConsents(),
      'Provider consents retrieved'
    );
  },

  revokeConsent: async (id: string): Promise<ApiResponse<ProviderConsent>> => {
    return executeWithFallback(
      () => apiClient.post(`/api/v1/medical-records/consents/${id}/revoke`),
      () => {
        const consents = getStoredConsents();
        const item = consents.find((c) => c.id === id);
        if (item) {
          item.status = 'REVOKED';
          try {
            localStorage.setItem(demoStorageKey(CONSENTS_STORAGE_KEY), JSON.stringify(consents));
          } catch {
            // ignore
          }
          return item;
        }
        throw new Error('Consent item not found');
      },
      'Provider access revoked'
    );
  },

  uploadRecord: async (record: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/medical-records', record),
      () => {
        const newRecord: MedicalRecord = {
          id: `rec-${Date.now()}`,
          patientId: 'usr-patient-001',
          title: record.title || 'Medical Record Document',
          recordType: record.recordType || 'LAB_REPORT',
          doctorName: record.doctorName || 'Dr. Sarah Jenkins',
          provider: record.provider || 'Metro Health Diagnostics',
          date: record.date || new Date().toISOString().split('T')[0],
          summary: record.summary || 'Uploaded health document',
          status: 'VERIFIED',
          fileSize: record.fileSize || '1.2 MB',
          fileType: record.fileType || 'PDF',
          tags: record.tags || ['general'],
          confidentialityLevel: record.confidentialityLevel || 'STANDARD',
        };
        const records = getStoredRecords();
        const updated = [newRecord, ...records];
        try {
          localStorage.setItem(demoStorageKey(RECORDS_STORAGE_KEY), JSON.stringify(updated));
        } catch {
          // ignore
        }
        return newRecord;
      },
      'Medical record uploaded successfully'
    );
  },
};
