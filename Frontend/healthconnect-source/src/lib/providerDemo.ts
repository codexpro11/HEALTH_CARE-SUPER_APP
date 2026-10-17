import type { Appointment, AppointmentStatus } from '../types';
import { mockDoctors } from '../data/mockData';
import { getDemoSession, getDemoScenario, isDemoMode, readStored, writeStored } from './demo';
import { getStoredAppointments, saveStoredAppointments } from '../api/appointmentApi';
import { getStoredRecords } from '../api/medicalRecordApi';
import { currentNfcAccess } from './nfcDemo';
import { providerQueue, saveConsultation, transitionAppointment, visibleRecordSummaries } from './providerRules';

export const PROVIDER_CHANGED = 'hc:provider-changed';

function actor(doctorId: string) {
  if (!isDemoMode) throw new Error('Provider workflows need a connected provider API outside demo mode.');
  const user = getDemoSession();
  if (!user) throw new Error('Sign in before opening the provider workspace.');
  if (user.role !== 'DOCTOR') throw new Error('Only the Doctor persona can open clinical workflows. NFC scanning remains available to other authorized provider roles.');
  if (!mockDoctors.some(doctor => doctor.id === doctorId)) throw new Error('Select a known demo doctor.');
  if (getDemoScenario() === 'error') throw new Error('Demo failure: provider data could not be loaded or saved. Change to the Success scenario and retry.');
  return { id: user.id, role: user.role, doctorId };
}

export function selectedDemoDoctor() {
  const user = getDemoSession();
  const id = readStored('hc_provider_doctor:' + user?.id, mockDoctors[0].id);
  return mockDoctors.find(doctor => doctor.id === id) ?? mockDoctors[0];
}

export function selectDemoDoctor(id: string) {
  const session = actor(id);
  writeStored('hc_provider_doctor:' + session.id, id);
  window.dispatchEvent(new Event(PROVIDER_CHANGED));
}

export function getProviderAppointments(doctorId: string) {
  const session = actor(doctorId);
  return getDemoScenario() === 'empty' ? [] : providerQueue(getStoredAppointments(), session);
}

function mutate(doctorId: string, id: string, operation: (item: Appointment) => Appointment) {
  const session = actor(doctorId);
  const all = getStoredAppointments();
  const index = all.findIndex(item => item.id === id && item.patientId === session.id && item.doctorId === doctorId);
  if (index < 0) throw new Error('Appointment not found for this doctor and account.');
  const next = operation(all[index]);
  // Persist status and consultation together; failed storage never updates the rendered state.
  saveStoredAppointments(all.map((item, i) => i === index ? next : item));
  window.dispatchEvent(new Event(PROVIDER_CHANGED));
  return next;
}

export function saveProviderConsultation(doctorId: string, id: string, notes: string, prescription: string) {
  return mutate(doctorId, id, item => saveConsultation(item, actor(doctorId), notes, prescription));
}

export function changeProviderAppointment(doctorId: string, id: string, next: AppointmentStatus,
  draft?: { notes: string; prescription: string }) {
  return mutate(doctorId, id, item => transitionAppointment(item, actor(doctorId), next, draft));
}

export function providerRecords(doctorId: string) {
  actor(doctorId);
  // The existing NFC consent fixture represents the first demo clinician only.
  if (doctorId !== mockDoctors[0].id) throw new Error('This doctor has no active NFC consent fixture. Select the first demo doctor and obtain patient consent.');
  const grant = currentNfcAccess('PT-1002');
  if (!grant || grant.emergency) throw new Error('A current standard NFC scan is required. Emergency access does not grant full record access.');
  return visibleRecordSummaries(getStoredRecords(), grant.scopes);
}
