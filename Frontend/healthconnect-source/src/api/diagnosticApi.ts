import { validateBooking } from '../lib/frontend';
import { readDiagnosticBookings, saveDiagnosticBookings } from '../lib/healthcareDemo';
import { validateDiagnosticRequest, type DiagnosticBookingRequest } from '../lib/healthcareRules';
import { apiClient, executeWithFallback } from './axios';
import {
  ApiResponse,
  DiagnosticCenter,
  DiagnosticTest,
  DiagnosticBooking,
} from '../types';
import {
  mockDiagnosticCenters,
  mockDiagnosticTests,
} from '../data/mockData';

export const diagnosticApi = {
  getDiagnosticCenters: async (search?: string): Promise<ApiResponse<DiagnosticCenter[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/diagnostics/centers', { params: { search } }),
      () => {
        if (!search) return mockDiagnosticCenters;
        const q = search.toLowerCase();
        return mockDiagnosticCenters.filter(
          (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
        );
      },
      'Diagnostic centers retrieved'
    );
  },

  getAllTests: async (category?: string, query?: string): Promise<ApiResponse<DiagnosticTest[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/diagnostics/tests', { params: { category, query } }),
      () => {
        let list = [...mockDiagnosticTests];
        if (category && category !== 'ALL') {
          list = list.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
        }
        if (query) {
          const q = query.toLowerCase();
          list = list.filter(
            (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
          );
        }
        return list;
      },
      'Diagnostic tests retrieved'
    );
  },

  getBookings: async (): Promise<ApiResponse<DiagnosticBooking[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/diagnostics/bookings'),
      () => readDiagnosticBookings(),
      'Diagnostic bookings retrieved'
    );
  },

  createBooking: async (booking: DiagnosticBookingRequest): Promise<ApiResponse<DiagnosticBooking>> => {
    const invalid = validateBooking(booking.scheduledDate, booking.scheduledTime);
    if (invalid) throw new Error(invalid);
    return executeWithFallback(
      () => apiClient.post('/api/v1/diagnostics/bookings', booking),
      () => {
        const current = readDiagnosticBookings();
        const center = mockDiagnosticCenters.find((c) => c.id === booking.centerId);
        const test = mockDiagnosticTests.find((t) => t.id === booking.testId);
        const error = validateDiagnosticRequest(booking, test, center, current);
        if (error) throw new Error(error);
        if (!center || !test) throw new Error('Test or center unavailable.');
        const newBooking: DiagnosticBooking = {
          id: 'diag-book-' + crypto.randomUUID(),
          bookingRef: `DB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          centerId: center.id,
          centerName: center.name,
          testId: test.id,
          testName: test.name,
          collectionType: booking.collectionType,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          status: 'BOOKED',
          price: test.discountedPrice ?? test.price,
          patientAddress: booking.collectionType === 'HOME_COLLECTION' ? booking.patientAddress?.trim() : undefined,
          createdAt: new Date().toISOString(),
        };

        const updated = [newBooking, ...current];
        saveDiagnosticBookings(updated);
        return newBooking;
      },
      'Diagnostic test booked successfully'
    );
  },

  cancelBooking: async (id: string): Promise<ApiResponse<DiagnosticBooking>> => executeWithFallback(
    () => apiClient.post(`/api/v1/diagnostics/bookings/${encodeURIComponent(id)}/cancel`),
    () => {
      const bookings = readDiagnosticBookings();
      const booking = bookings.find(item => item.id === id);
      if (!booking) throw new Error('Diagnostic booking unavailable.');
      if (booking.status !== 'BOOKED') throw new Error('Only an unstarted booking can be cancelled.');
      const updated: DiagnosticBooking = { ...booking, status: 'CANCELLED' };
      saveDiagnosticBookings(bookings.map(item => item.id === id ? updated : item));
      return updated;
    }, 'Diagnostic booking cancelled'),

  getTests: async (category?: string, query?: string): Promise<ApiResponse<DiagnosticTest[]>> => {
    return diagnosticApi.getAllTests(category, query);
  },

  bookTest: async (
    testId: string,
    date: string,
    isHomeCollection: boolean
  ): Promise<ApiResponse<DiagnosticBooking>> => {
    return diagnosticApi.createBooking({
      centerId: mockDiagnosticCenters[0].id,
      testId,
      collectionType: isHomeCollection ? 'HOME_COLLECTION' : 'CENTER_VISIT',
      scheduledDate: date,
      scheduledTime: '09:00 AM',
    });
  },
};

