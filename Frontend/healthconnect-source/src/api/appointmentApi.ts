import { validateBooking, demoSchedule, availableTimes, dateAfterDays } from '../lib/frontend';
import { getDemoSession } from '../lib/demo';
import { demoStorageKey } from '../lib/demo';
import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, Appointment, CreateAppointmentRequest } from '../types';
import { mockAppointments, mockDoctors } from '../data/mockData';

const APPOINTMENTS_STORAGE_KEY = 'hc_user_appointments';

export function getStoredAppointments(): Appointment[] {
  try {
    const saved = localStorage.getItem(demoStorageKey(APPOINTMENTS_STORAGE_KEY));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  const session = getDemoSession();
  return mockAppointments.map((appointment, index) => ({
    ...appointment, patientId: session?.id ?? appointment.patientId,
    patientName: session?.fullName ?? appointment.patientName,
    appointmentDate: appointment.status === 'CONFIRMED' ? dateAfterDays(index + 1) : appointment.appointmentDate,
  }));
}

export function saveStoredAppointments(list: Appointment[]) {
  try {
    localStorage.setItem(demoStorageKey(APPOINTMENTS_STORAGE_KEY), JSON.stringify(list));
  } catch {
    throw new Error('Appointment changes could not be saved in this browser.');
  }
}

export const appointmentApi = {
  getAppointments: async (status?: string): Promise<ApiResponse<Appointment[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/appointments', { params: { status } }),
      () => {
        const list = getStoredAppointments();
        if (!status || status === 'ALL') return list;
        return list.filter((a) => a.status === status);
      },
      'Appointments retrieved'
    );
  },

  getAppointmentById: async (id: string): Promise<ApiResponse<Appointment>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/appointments/${id}`),
      () => {
        const list = getStoredAppointments();
        const found = list.find((a) => a.id === id);
        if (!found) {
          throw new Error('Appointment not found');
        }
        return found;
      },
      'Appointment details retrieved'
    );
  },

  createAppointment: async (payload: CreateAppointmentRequest): Promise<ApiResponse<Appointment>> => {
    const invalid = validateBooking(payload.slotDate, payload.slotTime);
    if (invalid) throw new Error(invalid);
    return executeWithFallback(
      () => apiClient.post('/api/v1/appointments', payload),
      () => {
        const doctor = mockDoctors.find((d) => d.id === payload.doctorId);
        if (!doctor || !availableTimes(demoSchedule(doctor), payload.slotDate).includes(payload.slotTime)) throw new Error('Choose an available doctor slot.');
        if (!doctor.consultationTypes.includes(payload.consultationType)) throw new Error('This doctor does not offer the selected consultation type.');
        const current = getStoredAppointments();
        if (current.some(item => item.doctorId === doctor.id && item.appointmentDate === payload.slotDate && item.appointmentTime === payload.slotTime && ['BOOKED', 'CONFIRMED', 'IN_PROGRESS'].includes(item.status))) throw new Error('This slot is already booked. Choose another time.');
        const session = getDemoSession();
        const newApt: Appointment = {
          id: `apt-${Date.now()}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorSpecialization: doctor.specialization,
          doctorPhotoUrl: doctor.photoUrl,
          hospitalName: doctor.hospitalAffiliation,
          patientId: session?.id ?? 'demo-patient',
          patientName: session?.fullName ?? 'Demo Patient',
          appointmentDate: payload.slotDate,
          appointmentTime: payload.slotTime,
          consultationType: payload.consultationType,
          consultationFee: doctor.consultationFee,
          status: 'CONFIRMED',
          reasonForVisit: payload.reasonForVisit || 'General Medical Consultation',
          meetingLink: payload.consultationType === 'VIDEO' ? `https://telehealth.healthconnect.io/v/meet-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
          roomNumber: payload.consultationType === 'IN_PERSON' ? 'Room 204, East Wing' : undefined,
          createdAt: new Date().toISOString(),
        };
        const updated = [newApt, ...current];
        saveStoredAppointments(updated);
        return newApt;
      },
      'Appointment booked successfully'
    );
  },

  bookAppointment: async (payload: any): Promise<ApiResponse<Appointment>> => {
    return appointmentApi.createAppointment({
      doctorId: payload.doctorId,
      slotDate: payload.slotDate || payload.appointmentDate || '',
      slotTime: payload.slotTime || payload.appointmentTime || '',
      consultationType: payload.consultationType || 'VIDEO',
      reasonForVisit: payload.reasonForVisit || 'General Medical Consultation',
    });
  },

  rescheduleAppointment: async (
    id: string,
    updates: { slotDate: string; slotTime: string }
  ): Promise<ApiResponse<Appointment>> => {
    const invalid = validateBooking(updates.slotDate, updates.slotTime);
    if (invalid) throw new Error(invalid);
    return executeWithFallback(
      () => apiClient.patch(`/api/v1/appointments/${id}`, updates),
      () => {
        const list = getStoredAppointments();
        const idx = list.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error('Appointment not found');
        if (!['BOOKED', 'CONFIRMED'].includes(list[idx].status)) throw new Error('Only booked or confirmed appointments can be rescheduled.');
        const doctor = mockDoctors.find(item => item.id === list[idx].doctorId);
        if (!doctor || !availableTimes(demoSchedule(doctor), updates.slotDate).includes(updates.slotTime)) throw new Error('Choose an available doctor slot.');
        if (list.some(item => item.id !== id && item.doctorId === list[idx].doctorId && item.appointmentDate === updates.slotDate && item.appointmentTime === updates.slotTime && ['BOOKED', 'CONFIRMED', 'IN_PROGRESS'].includes(item.status))) throw new Error('This slot is already booked. Choose another time.');
        const updatedItem: Appointment = {
          ...list[idx],
          appointmentDate: updates.slotDate,
          appointmentTime: updates.slotTime,
          status: 'CONFIRMED',
          updatedAt: new Date().toISOString(),
        };
        list[idx] = updatedItem;
        saveStoredAppointments(list);
        return updatedItem;
      },
      'Appointment rescheduled successfully'
    );
  },

  cancelAppointment: async (id: string, reason?: string): Promise<ApiResponse<Appointment>> => {
    return executeWithFallback(
      () => apiClient.delete(`/api/v1/appointments/${id}`, { data: { reason } }),
      () => {
        const list = getStoredAppointments();
        const idx = list.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error('Appointment not found');
        if (!['BOOKED', 'CONFIRMED'].includes(list[idx].status)) throw new Error('This appointment can no longer be cancelled.');
        const updatedItem: Appointment = {
          ...list[idx],
          status: 'CANCELLED',
          notes: reason ? `Cancelled by patient: ${reason}` : 'Cancelled by patient',
          updatedAt: new Date().toISOString(),
        };
        list[idx] = updatedItem;
        saveStoredAppointments(list);
        return updatedItem;
      },
      'Appointment cancelled'
    );
  },
};
