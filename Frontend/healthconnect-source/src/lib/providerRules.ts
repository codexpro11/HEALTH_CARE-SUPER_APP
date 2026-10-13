import type { Appointment, AppointmentStatus, MedicalRecord } from '../types';

export interface ClinicianActor {
  id: string;
  role: string;
  doctorId: string;
}

export function requireAssignedDoctor(appointment: Appointment, actor: ClinicianActor) {
  if (actor.role !== 'DOCTOR') throw new Error('Only the Doctor persona can manage consultations.');
  if (!actor.id || appointment.patientId !== actor.id || appointment.doctorId !== actor.doctorId) {
    throw new Error('This appointment is not assigned to the selected demo doctor and account.');
  }
}

export function providerQueue(appointments: Appointment[], actor: ClinicianActor): Appointment[] {
  if (actor.role !== 'DOCTOR' || !actor.id) return [];
  return appointments.filter(item => item.patientId === actor.id && item.doctorId === actor.doctorId)
    .sort((a, b) => (a.appointmentDate + a.appointmentTime).localeCompare(b.appointmentDate + b.appointmentTime));
}

const transitions: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  BOOKED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED'],
};

export function allowedProviderTransitions(status: AppointmentStatus): AppointmentStatus[] {
  return transitions[status] ?? [];
}

export function saveConsultation(appointment: Appointment, actor: ClinicianActor,
  notes: string, prescription: string, now = new Date().toISOString()): Appointment {
  requireAssignedDoctor(appointment, actor);
  if (appointment.status !== 'IN_PROGRESS') throw new Error('Start the consultation before saving. Completed consultations are read-only.');
  if (notes.trim().length < 10 || notes.length > 10000) throw new Error('Enter consultation notes between 10 and 10,000 characters.');
  if (prescription.length > 4000) throw new Error('Keep the prescription draft within 4,000 characters.');
  return { ...appointment, consultation: { notes: notes.trim(), prescription: prescription.trim(), updatedAt: now }, updatedAt: now };
}

export function transitionAppointment(appointment: Appointment, actor: ClinicianActor,
  next: AppointmentStatus, draft?: { notes: string; prescription: string }, now = new Date().toISOString()): Appointment {
  requireAssignedDoctor(appointment, actor);
  if (!allowedProviderTransitions(appointment.status).includes(next)) throw new Error('This appointment status change is not allowed.');
  const item = next === 'COMPLETED'
    ? saveConsultation(appointment, actor, draft?.notes ?? appointment.consultation?.notes ?? '',
      draft?.prescription ?? appointment.consultation?.prescription ?? '', now)
    : appointment;
  return { ...item, status: next, updatedAt: now,
    providerTimeline: [...(item.providerTimeline ?? []), { status: next, at: now }] };
}

export function visibleRecordSummaries(records: MedicalRecord[], scopes: string[]) {
  if (!scopes.includes('Basic Profile')) return [];
  return records.filter(record => {
    if (record.confidentialityLevel !== 'STANDARD') return false;
    const scope = record.recordType === 'LAB_REPORT' ? 'Diagnostic Reports'
      : record.recordType === 'PRESCRIPTION' ? 'Prescriptions' : 'Medical Summary';
    return scopes.includes(scope);
  }).map(({ id, title, recordType, date, summary, doctorName }) =>
    ({ id, title, recordType, date, summary, doctorName }));
}
