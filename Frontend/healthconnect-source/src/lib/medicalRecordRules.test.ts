import test from 'node:test';
import assert from 'node:assert/strict';
import type { MedicalRecord } from '../types';
import { canShareRecord, sharingProviders, selectRecords, groupRecordTimeline, initialRecordFilters, validateRecordMetadata } from './medicalRecordRules';
import { visibleRecordSummaries } from './providerRules';

const record: MedicalRecord = { id: 'lab', patientId: 'patient-a', title: 'CBC report', recordType: 'DIAGNOSTIC_REPORT', doctorName: 'Dr. Reed',
  provider: 'Metro clinic', date: '2026-08-21', summary: 'Lab findings', status: 'VERIFIED', tags: ['blood'], confidentialityLevel: 'STANDARD' };

test('diagnostic documents require the diagnostic scope and omit attachments from provider output', () => {
  for (const recordType of ['DIAGNOSTIC_REPORT', 'LAB_REPORT', 'RADIOLOGY'] as const) {
    const item = { ...record, recordType, fileUrl: '/private/attachment.pdf' };
    assert.equal(canShareRecord(item, ['Basic Profile', 'Medical Summary']), false);
    assert.equal(canShareRecord(item, ['Basic Profile', 'Diagnostic Reports']), true);
    const summaries = visibleRecordSummaries([item], ['Basic Profile', 'Diagnostic Reports']);
    assert.equal(summaries.length, 1);
    assert.equal('fileUrl' in summaries[0], false);
  }
});
test('archived, restricted, confidential and unknown types never enter provider summaries', () => {
  const scopes = ['Basic Profile', 'Medical Summary', 'Diagnostic Reports', 'Prescriptions'];
  for (const item of [{ ...record, status: 'ARCHIVED' }, { ...record, confidentialityLevel: 'RESTRICTED' },
    { ...record, confidentialityLevel: 'CONFIDENTIAL' }, { ...record, recordType: 'UNKNOWN' }]) {
    assert.equal(canShareRecord(item as MedicalRecord, scopes), false);
  }
  assert.equal(canShareRecord(record, ['Diagnostic Reports']), false);
});
test('sharing visibility excludes revoked, expired and missing-scope consent', () => {
  const now = Date.parse('2026-10-13T00:00:00Z');
  const consent = { provider: 'Dr. Reed', status: 'ACTIVE', expiry: '2027-01-01', scopes: ['Basic Profile', 'Diagnostic Reports'] };
  assert.deepEqual(sharingProviders(record, [consent], now), ['Dr. Reed']);
  for (const value of [{ ...consent, status: 'REVOKED' }, { ...consent, expiry: '2026-10-13' },
    { ...consent, expiry: 'invalid' }, { ...consent, scopes: ['Basic Profile', 'Medical Summary'] }]) {
    assert.deepEqual(sharingProviders(record, [value], now), []);
  }
});
test('search includes tags and facility, applies inclusive dates and does not mutate data', () => {
  const records = [record, { ...record, id: 'older', date: '2026-06-12' }, { ...record, id: 'archived', status: 'ARCHIVED' as const }];
  assert.deepEqual(selectRecords(records, { ...initialRecordFilters, search: '  BLOOD ', from: record.date, to: record.date }).map(item => item.id), ['lab']);
  assert.equal(selectRecords(records, { ...initialRecordFilters, search: 'metro' }).length, 2);
  assert.deepEqual(selectRecords(records, { ...initialRecordFilters, status: 'ARCHIVED' }).map(item => item.id), ['archived']);
  assert.deepEqual(selectRecords(records, { ...initialRecordFilters, sort: 'OLDEST' }).map(item => item.id), ['older', 'lab']);
  assert.equal(records[0].id, 'lab');
});
test('timeline groups months, and invalid record dates or future metadata are rejected', () => {
  assert.equal(groupRecordTimeline([record, { ...record, id: 'another' }])[0][1].length, 2);
  assert.equal(validateRecordMetadata(record, '2026-10-13'), null);
  for (const date of ['2026-10-14', '2026-02-30', '2026-13-01', 'not-a-date', '']) {
    assert.match(validateRecordMetadata({ ...record, date }, '2026-10-13')!, /valid document date/);
  }
  assert.match(validateRecordMetadata({ ...record, title: ' ' }, '2026-10-13')!, /title/);
});
