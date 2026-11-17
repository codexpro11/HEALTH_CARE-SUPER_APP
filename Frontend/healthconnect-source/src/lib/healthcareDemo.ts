import type { DiagnosticBooking, PharmacyOrder } from '../types';
import { getDemoSession, writeStored } from './demo';
import { mockDiagnosticBookings, mockOrders } from '../data/mockData';

export function requireServicePatient() {
  const user = getDemoSession();
  if (!user || user.role !== 'PATIENT') throw new Error('Sign in as a patient to manage healthcare services.');
  return user;
}

function readServiceData<T>(key: string, fixtures: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw === null) return structuredClone(fixtures);
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Invalid data');
    return parsed as T[];
  } catch { throw new Error('Saved service data could not be read. Your existing data was not replaced.'); }
}

export function readDiagnosticBookings(): DiagnosticBooking[] {
  const patient = requireServicePatient();
  return readServiceData('hc_diag_bookings:' + patient.id, mockDiagnosticBookings);
}
export function saveDiagnosticBookings(bookings: DiagnosticBooking[]) {
  const patient = requireServicePatient();
  writeStored('hc_diag_bookings:' + patient.id, bookings);
}
export function readPharmacyOrders(): PharmacyOrder[] {
  const patient = requireServicePatient();
  return readServiceData('hc_pharmacy_orders:' + patient.id, mockOrders.map(order => ({ ...order, patientId: patient.id })))
    .map(order => ({ ...order, patientId: patient.id }));
}
export function savePharmacyOrders(orders: PharmacyOrder[]) {
  const patient = requireServicePatient();
  writeStored('hc_pharmacy_orders:' + patient.id, orders);
}
