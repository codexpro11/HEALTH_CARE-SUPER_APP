import { validateCheckout } from '../lib/frontend';
import { readPharmacyOrders, requireServicePatient, savePharmacyOrders } from '../lib/healthcareDemo';
import { canCancelOrder, canonicalCart, prescriptionRecords, quoteCart, validatePharmacyRequest } from '../lib/healthcareRules';
import { getStoredRecords } from './medicalRecordApi';
import { apiClient, executeWithFallback } from './axios';
import {
  ApiResponse,
  Medicine,
  PharmacyOrder,
  CartItem,
} from '../types';
import { mockMedicines } from '../data/mockData';

export const pharmacyApi = {
  getMedicines: async (
    categoryOrFilter?: string | { category?: string; search?: string; query?: string },
    query?: string
  ): Promise<ApiResponse<Medicine[]>> => {
    let cat: string | undefined;
    let q: string | undefined;

    if (typeof categoryOrFilter === 'object' && categoryOrFilter !== null) {
      cat = categoryOrFilter.category;
      q = categoryOrFilter.search || categoryOrFilter.query;
    } else if (typeof categoryOrFilter === 'string') {
      cat = categoryOrFilter;
      q = query;
    } else {
      q = query;
    }

    return executeWithFallback(
      () => apiClient.get('/api/v1/pharmacy/medicines', { params: { category: cat, query: q } }),
      () => {
        let list = [...mockMedicines];
        if (cat && cat !== 'ALL') {
          list = list.filter((m) => m.category.toLowerCase().includes(cat!.toLowerCase()));
        }
        if (q) {
          const lowerQ = q.toLowerCase();
          list = list.filter(
            (m) =>
              m.name.toLowerCase().includes(lowerQ) ||
              m.genericName.toLowerCase().includes(lowerQ) ||
              m.description.toLowerCase().includes(lowerQ)
          );
        }
        return list;
      },
      'Medicines retrieved'
    );
  },

  getMedicineById: async (id: string): Promise<ApiResponse<Medicine>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/pharmacy/medicines/${id}`),
      () => {
        const found = mockMedicines.find((m) => m.id === id);
        if (!found) throw new Error('Medicine unavailable.');
        return found;
      },
      'Medicine details retrieved'
    );
  },

  getOrders: async (): Promise<ApiResponse<PharmacyOrder[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/pharmacy/orders'),
      () => readPharmacyOrders(),
      'Orders retrieved'
    );
  },

  createOrder: async (payload: {
    items: CartItem[];
    deliveryAddress: string;
    paymentMethod: PharmacyOrder['paymentMethod'];
    prescriptionUploaded?: boolean;
    prescriptionRecordId?: string;
  }): Promise<ApiResponse<PharmacyOrder>> => {
    const invalid = validateCheckout(payload.items, payload.deliveryAddress);
    if (invalid) throw new Error(invalid);
    return executeWithFallback(
      () => apiClient.post('/api/v1/pharmacy/orders', payload),
      () => {
        const patient = requireServicePatient();
        if (!['CARD', 'UPI', 'CASH_ON_DELIVERY', 'INSURANCE', 'COD'].includes(payload.paymentMethod)) throw new Error('Choose a supported payment method.');
        const items = canonicalCart(payload.items, mockMedicines);
        const records = prescriptionRecords(getStoredRecords(), patient.id);
        const invalid = validatePharmacyRequest(items, payload.deliveryAddress, payload.prescriptionRecordId, records);
        if (invalid) throw new Error(invalid);
        const { subtotal, deliveryFee, total: finalTotal } = quoteCart(items);
        const prescriptionRequired = items.some(item => item.medicine.requiresPrescription);
        const status = prescriptionRequired ? 'PHARMACY_PROCESSING' : 'CONFIRMED';
        const timestamp = new Date().toISOString();
        const discount = 0;

        const newOrder: PharmacyOrder = {
          id: 'ord-' + crypto.randomUUID(),
          orderNumber: `HC-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: patient.id,
          items,
          totalAmount: subtotal,
          discountAmount: discount,
          deliveryFee,
          finalAmount: finalTotal,
          deliveryAddress: payload.deliveryAddress.trim(),
          prescriptionUploaded: prescriptionRequired,
          prescriptionRecordId: prescriptionRequired ? payload.prescriptionRecordId : undefined,
          status,
          paymentMethod: payload.paymentMethod,
          createdAt: new Date().toISOString(),
          estimatedDeliveryTime: 'Not scheduled in demo',
          timeline: [
            {
              status: 'CREATED',
              timestamp,
              description: 'Demo order saved; no payment processed',
            },
            {
              status,
              timestamp,
              description: prescriptionRequired ? 'Prescription reference selected; pharmacist review is simulated and pending' : 'Demo confirmation; no shipment or insurance approval',
            },
          ],
        };

        const current = readPharmacyOrders();
        const updated = [newOrder, ...current];
        savePharmacyOrders(updated);
        return newOrder;
      },
      'Order placed successfully'
    );
  },

  cancelOrder: async (id: string): Promise<ApiResponse<PharmacyOrder>> => executeWithFallback(
    () => apiClient.post(`/api/v1/pharmacy/orders/${encodeURIComponent(id)}/cancel`),
    () => {
      const orders = readPharmacyOrders();
      const order = orders.find(item => item.id === id);
      if (!order) throw new Error('Order unavailable.');
      if (!canCancelOrder(order.status)) throw new Error('This order can no longer be cancelled.');
      const cancelled: PharmacyOrder = { ...order, status: 'CANCELLED', timeline: [...order.timeline, {
        status: 'CANCELLED', timestamp: new Date().toISOString(), description: 'Demo cancellation saved; no payment or refund processed',
      }] };
      savePharmacyOrders(orders.map(item => item.id === id ? cancelled : item));
      return cancelled;
    }, 'Order cancelled'),
};

