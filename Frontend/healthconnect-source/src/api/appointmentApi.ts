import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, Appointment, CreateAppointmentRequest } from '../types';
import { mockAppointments, mockDoctors } from '../data/mockData';

const APPOINTMENTS_STORAGE_KEY = 'hc_user_appointments';

function getStoredAppointments(): Appointment[] {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return mockAppointments;
}

function saveStoredAppointments(list: Appointment[]) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
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
    return executeWithFallback(
      () => apiClient.post('/api/v1/appointments', payload),
      () => {
        const doctor = mockDoctors.find((d) => d.id === payload.doctorId) || mockDoctors[0];
        const newApt: Appointment = {
          id: `apt-${Date.now()}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorSpecialization: doctor.specialization,
          doctorPhotoUrl: doctor.photoUrl,
          hospitalName: doctor.hospitalAffiliation,
          patientId: 'usr-patient-001',
          patientName: 'Sarah Jenkins',
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
        const current = getStoredAppointments();
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
      slotDate: payload.slotDate || payload.appointmentDate || '2026-09-15',
      slotTime: payload.slotTime || payload.appointmentTime || '10:00 AM',
      consultationType: payload.consultationType || 'VIDEO',
      reasonForVisit: payload.reasonForVisit || 'General Medical Consultation',
    });
  },

  rescheduleAppointment: async (
    id: string,
    updates: { slotDate: string; slotTime: string }
  ): Promise<ApiResponse<Appointment>> => {
    return executeWithFallback(
      () => apiClient.patch(`/api/v1/appointments/${id}`, updates),
      () => {
        const list = getStoredAppointments();
        const idx = list.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error('Appointment not found');
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
