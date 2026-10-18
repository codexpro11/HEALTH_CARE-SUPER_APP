import type { MedicalRecord, RecordType } from '../types';

export type RecordScope = 'Diagnostic Reports' | 'Prescriptions' | 'Medical Summary';
export function recordScope(type: RecordType): RecordScope | null {
  if (['LAB_REPORT', 'DIAGNOSTIC_REPORT', 'RADIOLOGY'].includes(type)) return 'Diagnostic Reports';
  if (type === 'PRESCRIPTION') return 'Prescriptions';
  if (['CONSULTATION_NOTE', 'CLINICAL_NOTE', 'DISCHARGE_SUMMARY', 'VACCINATION', 'ALLERGY', 'SURGICAL_HISTORY', 'DOCUMENT'].includes(type)) return 'Medical Summary';
  return null;
}

export function canShareRecord(record: MedicalRecord, scopes: string[]): boolean {
  const scope = recordScope(record.recordType);
  return record.status !== 'ARCHIVED' && record.confidentialityLevel === 'STANDARD' &&
    scopes.includes('Basic Profile') && scope !== null && scopes.includes(scope);
}

export interface RecordConsent { provider: string; scopes: string[]; status: string; expiry: string; }
export function sharingProviders(record: MedicalRecord, consents: RecordConsent[], now = Date.now()): string[] {
  return consents.filter(consent => consent.status === 'ACTIVE' && Date.parse(consent.expiry) > now &&
    canShareRecord(record, consent.scopes)).map(consent => consent.provider);
}

export interface RecordFilters {
  search: string;
  type: string;
  status: 'ALL' | 'ACTIVE' | 'ARCHIVED';
  from: string;
  to: string;
  sort: 'NEWEST' | 'OLDEST' | 'TITLE';
}
export const initialRecordFilters: RecordFilters = { search: '', type: 'ALL', status: 'ACTIVE', from: '', to: '', sort: 'NEWEST' };
export function selectRecords(records: MedicalRecord[], filters: RecordFilters): MedicalRecord[] {
  const search = filters.search.trim().toLowerCase();
  return records.filter(record =>
    (filters.type === 'ALL' || record.recordType === filters.type) &&
    (filters.status === 'ALL' || (filters.status === 'ARCHIVED' ? record.status === 'ARCHIVED' : record.status !== 'ARCHIVED')) &&
    (!filters.from || record.date >= filters.from) && (!filters.to || record.date <= filters.to) &&
    (!search || [record.title, record.doctorName, record.provider, record.summary, ...(record.tags ?? [])]
      .some(value => value?.toLowerCase().includes(search))))
    .sort((a, b) => filters.sort === 'TITLE' ? a.title.localeCompare(b.title) || a.id.localeCompare(b.id)
      : (filters.sort === 'OLDEST' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) || a.id.localeCompare(b.id));
}

export function groupRecordTimeline(records: MedicalRecord[]) {
  const groups = new Map<string, MedicalRecord[]>();
  for (const record of records) {
    const month = /^\d{4}-\d{2}-\d{2}$/.test(record.date) ? record.date.slice(0, 7) : 'Undated';
    groups.set(month, [...(groups.get(month) ?? []), record]);
  }
  return [...groups.entries()];
}

export function validateRecordMetadata(record: Partial<MedicalRecord>, today: string): string | null {
  if (!record.title?.trim() || record.title.trim().length > 200) return 'Enter a document title between 1 and 200 characters.';
  const date = record.date ?? '';
  const parsed = new Date(date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > today) {
    return 'Choose a valid document date on or before today.';
  }
  if (!record.recordType || !recordScope(record.recordType)) return 'Choose a supported record category.';
  if (!['STANDARD', 'RESTRICTED', 'CONFIDENTIAL'].includes(record.confidentialityLevel ?? 'STANDARD')) return 'Choose a valid privacy level.';
  if ((record.summary?.length ?? 0) > 10000) return 'Keep document notes within 10,000 characters.';
  return null;
}
