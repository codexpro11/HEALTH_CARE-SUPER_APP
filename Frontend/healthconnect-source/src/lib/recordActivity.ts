import { demoStorageKey, getDemoSession, readStored, writeStored } from './demo';

export type RecordActivityAction = 'UPLOADED' | 'VIEWED' | 'DOWNLOADED' | 'ARCHIVED' | 'RESTORED';
export interface RecordActivity {
  id: string;
  recordId: string;
  title: string;
  action: RecordActivityAction;
  timestamp: string;
}
export function requireRecordPatient() {
  const user = getDemoSession();
  if (!user || user.role !== 'PATIENT') throw new Error('Sign in as the patient to manage personal documents.');
  return user;
}
export function getRecordActivity(): RecordActivity[] {
  requireRecordPatient();
  return readStored<RecordActivity[]>(demoStorageKey('hc_record_activity'), []);
}
export function appendRecordActivity(recordId: string, title: string, action: RecordActivityAction) {
  requireRecordPatient();
  const activity: RecordActivity = { id: crypto.randomUUID(), recordId, title, action, timestamp: new Date().toISOString() };
  writeStored(demoStorageKey('hc_record_activity'), [activity, ...getRecordActivity()].slice(0, 100));
}
