import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedProviderTransitions, providerQueue, saveConsultation, transitionAppointment, visibleRecordSummaries } from './providerRules.ts';
import type { Appointment, MedicalRecord } from '../types';

const actor = { id: 'account-a', role: 'DOCTOR', doctorId: 'doc-001' };
const appointment = { id: 'apt-a', patientId: actor.id, doctorId: actor.doctorId, status: 'CONFIRMED' } as Appointment;

test('queue filters foreign accounts and other doctors', () => {
  const list = [{ ...appointment, appointmentDate: '2026-10-14', appointmentTime: '10:00 AM' },
    { ...appointment, id: 'foreign', patientId: 'account-b' }, { ...appointment, id: 'other', doctorId: 'doc-002' }];
  assert.deepEqual(providerQueue(list, actor).map(item => item.id), ['apt-a']);
  assert.deepEqual(providerQueue(list, { ...actor, role: 'HOSPITAL' }), []);
});

test('doctor can start, save and complete with durable consultation content', () => {
  const started = transitionAppointment(appointment, actor, 'IN_PROGRESS');
  const saved = saveConsultation(started, actor, 'Reviewed symptoms with patient.', 'Demo medication draft');
  const completed = transitionAppointment(saved, actor, 'COMPLETED');
  assert.equal(completed.consultation?.notes, 'Reviewed symptoms with patient.');
  assert.equal(completed.status, 'COMPLETED');
  assert.deepEqual(completed.providerTimeline?.map(item => item.status), ['IN_PROGRESS', 'COMPLETED']);
  assert.equal(appointment.status, 'CONFIRMED');
});

test('invalid and terminal status transitions fail', () => {
  assert.throws(() => transitionAppointment(appointment, actor, 'COMPLETED'), /not allowed/);
  for (const status of ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED'] as const) {
    assert.deepEqual(allowedProviderTransitions(status), []);
    assert.throws(() => transitionAppointment({ ...appointment, status }, actor, 'IN_PROGRESS'), /not allowed/);
  }
});

test('roles, doctor assignment and account boundaries are enforced at mutation', () => {
  assert.throws(() => transitionAppointment(appointment, { ...actor, role: 'PATIENT' }, 'IN_PROGRESS'), /Doctor persona/);
  assert.throws(() => transitionAppointment(appointment, { ...actor, role: 'ADMIN' }, 'IN_PROGRESS'), /Doctor persona/);
  assert.throws(() => transitionAppointment(appointment, { ...actor, id: 'account-b' }, 'IN_PROGRESS'), /not assigned/);
  assert.throws(() => transitionAppointment(appointment, { ...actor, doctorId: 'doc-002' }, 'IN_PROGRESS'), /not assigned/);
});

test('notes require started appointment and valid length; prescription length is bounded', () => {
  assert.throws(() => saveConsultation(appointment, actor, 'Valid consultation notes', ''), /Start/);
  const started = { ...appointment, status: 'IN_PROGRESS' as const };
  assert.throws(() => saveConsultation(started, actor, 'short', ''), /10/);
  assert.throws(() => saveConsultation(started, actor, 'x'.repeat(10001), ''), /10,000/);
  assert.throws(() => saveConsultation(started, actor, 'Valid consultation notes', 'x'.repeat(4001)), /4,000/);
  assert.throws(() => transitionAppointment(started, actor, 'COMPLETED'), /10/);
});

test('completion saves the latest draft atomically and completed notes are immutable', () => {
  const complete = transitionAppointment({ ...appointment, status: 'IN_PROGRESS' }, actor, 'COMPLETED',
    { notes: 'Latest consultation notes.', prescription: '' });
  assert.equal(complete.consultation?.notes, 'Latest consultation notes.');
  assert.throws(() => saveConsultation(complete, actor, 'Changed notes.', ''), /read-only/);
});

test('scope filtering excludes attachments and restricted content', () => {
  const records = [
    { id: 'lab', recordType: 'LAB_REPORT', confidentialityLevel: 'STANDARD', fileUrl: '/private/file' },
    { id: 'rx', recordType: 'PRESCRIPTION', confidentialityLevel: 'STANDARD' },
    { id: 'note', recordType: 'CONSULTATION_NOTE', confidentialityLevel: 'STANDARD' },
    { id: 'secret', recordType: 'LAB_REPORT', confidentialityLevel: 'CONFIDENTIAL' },
  ] as MedicalRecord[];
  assert.deepEqual(visibleRecordSummaries(records, []).map(r => r.id), []);
  assert.deepEqual(visibleRecordSummaries(records, ['Basic Profile']).map(r => r.id), []);
  const summaries = visibleRecordSummaries(records, ['Basic Profile', 'Diagnostic Reports']);
  assert.deepEqual(summaries.map(r => r.id), ['lab']);
  assert.equal('fileUrl' in summaries[0], false);
  assert.deepEqual(visibleRecordSummaries(records, ['Basic Profile', 'Prescriptions']).map(r => r.id), ['rx']);
});
