import { demoStorageKey, isDemoMode, writeStored } from '../lib/demo';
import { readDemoRecordAttachment, saveDemoRecordAttachment } from '../lib/recordAttachments';
import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, MedicalRecord, Prescription, ProviderConsent, RecordType } from '../types';
import { mockMedicalRecords, mockPrescriptions, mockProviderConsents } from '../data/mockData';
import { appendRecordActivity, getRecordActivity, requireRecordPatient, type RecordActivity } from '../lib/recordActivity';
import { validateRecordAttachment, deleteDemoRecordAttachment } from '../lib/recordAttachments';
import { validateRecordMetadata } from '../lib/medicalRecordRules';
import { localDate } from '../lib/frontend';

const RECORDS_STORAGE_KEY = 'hc_user_records';
const CONSENTS_STORAGE_KEY = 'hc_user_consents';

export function getStoredRecords(): MedicalRecord[] {
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
        const today = new Date(); const day = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
        const list = mockPrescriptions.map(p => ({...p, status: p.status === 'ACTIVE' && p.validUntil < day ? 'EXPIRED' as const : p.status}));
        if (!status || status === 'ALL') return list;
        return list.filter(p => p.status === status);
      },
      'Prescriptions retrieved'
    );
  },

  getPrescriptionById: async (id: string): Promise<ApiResponse<Prescription>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/prescriptions/${id}`),
      () => {
        const found = mockPrescriptions.find((p) => p.id === id);
        if (!found) throw new Error('Prescription not found.');
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

  uploadRecord: async (record: Partial<MedicalRecord>, file?: File): Promise<ApiResponse<MedicalRecord>> => {
    const metadataError = validateRecordMetadata(record, localDate());
    const fileError = file ? validateRecordAttachment(file) : null;
    if (metadataError || fileError) throw new Error(metadataError || fileError!);
    return executeWithFallback(
      () => {
        if (!file) return apiClient.post('/api/v1/medical-records', record);
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(record)], { type: 'application/json' }), 'record.json');
        form.append('file', file, file.name);
        return apiClient.post('/api/v1/medical-records', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      async () => {
        const user = requireRecordPatient();
        const id = 'rec-' + crypto.randomUUID();
        const newRecord: MedicalRecord = {
          id,
          patientId: user.id,
          title: record.title || 'Medical Record Document',
          recordType: record.recordType || 'LAB_REPORT',
          doctorName: record.doctorName || 'Not provided',
          provider: record.provider || 'Not provided',
          date: record.date || new Date().toISOString().slice(0, 10),
          summary: record.summary || 'Patient-uploaded health record document.',
          status: 'PENDING',
          fileSize: file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : record.fileSize,
          fileType: file?.type || record.fileType,
          fileMimeType: file?.type || record.fileMimeType,
          originalFileName: file?.name || record.originalFileName,
          tags: record.tags || ['patient-upload'],
          confidentialityLevel: record.confidentialityLevel || 'STANDARD',
        };
        const records = getStoredRecords();
        if (file) await saveDemoRecordAttachment(demoStorageKey('hc_record_file:' + id), file);
        try { writeStored(demoStorageKey(RECORDS_STORAGE_KEY), [newRecord, ...records]); }
        catch (error) {
          if (file) await deleteDemoRecordAttachment(demoStorageKey('hc_record_file:' + id)).catch(() => {});
          throw error;
        }
        // A history failure must not turn a successfully saved document into a retry/duplicate.
        try { appendRecordActivity(id, newRecord.title, 'UPLOADED'); } catch { /* visible storage is authoritative */ }
        return newRecord;
      },
      'Medical record uploaded successfully'
    );
  },

  getAttachment: async (record: MedicalRecord): Promise<Blob> => {
    if (isDemoMode) {
      requireRecordPatient();
      if (!getStoredRecords().some(item => item.id === record.id)) throw new Error('This record is unavailable in this account.');
      const attachment = await readDemoRecordAttachment(demoStorageKey('hc_record_file:' + record.id));
      if (!attachment) throw new Error('No saved file is available for this record.');
      return attachment;
    }
    if (!record.fileUrl && !record.originalFileName) {
      throw new Error('This record does not have an attached file.');
    }
    const response = await apiClient.get(record.fileUrl || `/api/v1/medical-records/${encodeURIComponent(record.id)}/file`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  setArchived: async (id: string, archived: boolean): Promise<ApiResponse<MedicalRecord>> => executeWithFallback(
    () => apiClient.post(`/api/v1/medical-records/${encodeURIComponent(id)}/${archived ? 'archive' : 'restore'}`),
    () => {
      requireRecordPatient();
      const records = getStoredRecords();
      const item = records.find(record => record.id === id);
      if (!item) throw new Error('This record is unavailable in this account.');
      const previous = (item as MedicalRecord & { previousStatus?: MedicalRecord['status'] }).previousStatus;
      const next = archived ? { ...item, previousStatus: item.status, status: 'ARCHIVED' as const }
        : { ...item, status: previous === 'VERIFIED' ? 'VERIFIED' as const : 'PENDING' as const };
      if ((item.status === 'ARCHIVED') === archived) return item;
      writeStored(demoStorageKey(RECORDS_STORAGE_KEY), records.map(record => record.id === id ? next : record));
      try { appendRecordActivity(id, item.title, archived ? 'ARCHIVED' : 'RESTORED'); } catch { /* do not retry a completed write */ }
      return next;
    }, 'Document status updated'),

  getActivity: async (): Promise<ApiResponse<RecordActivity[]>> => executeWithFallback(
    () => apiClient.get('/api/v1/medical-records/activity'), () => getRecordActivity(), 'Document activity fetched'),

  logActivity: (record: MedicalRecord, action: 'VIEWED' | 'DOWNLOADED') => {
    if (isDemoMode) appendRecordActivity(record.id, record.title, action);
    // In live mode, reads/downloads must be audited by the backend that authorizes them.
  },
};
