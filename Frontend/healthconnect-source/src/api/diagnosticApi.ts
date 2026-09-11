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
  mockDiagnosticBookings,
} from '../data/mockData';

const DIAG_BOOKINGS_KEY = 'hc_diag_bookings';

function getStoredDiagBookings(): DiagnosticBooking[] {
  try {
    const saved = localStorage.getItem(DIAG_BOOKINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return mockDiagnosticBookings;
}

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
      () => getStoredDiagBookings(),
      'Diagnostic bookings retrieved'
    );
  },

  createBooking: async (booking: {
    centerId: string;
    testId: string;
    collectionType: 'HOME_COLLECTION' | 'CENTER_VISIT';
    scheduledDate: string;
    scheduledTime: string;
    patientAddress?: string;
  }): Promise<ApiResponse<DiagnosticBooking>> => {
    return executeWithFallback(
      () => apiClient.post('/api/v1/diagnostics/bookings', booking),
      () => {
        const center = mockDiagnosticCenters.find((c) => c.id === booking.centerId) || mockDiagnosticCenters[0];
        const test = mockDiagnosticTests.find((t) => t.id === booking.testId) || mockDiagnosticTests[0];

        const newBooking: DiagnosticBooking = {
          id: `diag-book-${Date.now()}`,
          bookingRef: `DB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          centerId: center.id,
          centerName: center.name,
          testId: test.id,
          testName: test.name,
          collectionType: booking.collectionType,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          status: 'BOOKED',
          price: test.discountedPrice || test.price,
          patientAddress: booking.patientAddress,
          createdAt: new Date().toISOString(),
        };

        const current = getStoredDiagBookings();
        const updated = [newBooking, ...current];
        try {
          localStorage.setItem(DIAG_BOOKINGS_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return newBooking;
      },
      'Diagnostic test booked successfully'
    );
  },

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
