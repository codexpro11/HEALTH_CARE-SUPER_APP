import { validateCheckout } from '../lib/frontend';
import { getDemoSession } from '../lib/demo';
import { demoStorageKey } from '../lib/demo';
import { apiClient, executeWithFallback } from './axios';
import {
  ApiResponse,
  Medicine,
  PharmacyOrder,
  CartItem,
} from '../types';
import { mockMedicines, mockOrders } from '../data/mockData';

const ORDERS_STORAGE_KEY = 'hc_pharmacy_orders';

function getStoredOrders(): PharmacyOrder[] {
  try {
    const saved = localStorage.getItem(demoStorageKey(ORDERS_STORAGE_KEY));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return mockOrders;
}

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
        const found = mockMedicines.find((m) => m.id === id) || mockMedicines[0];
        return found;
      },
      'Medicine details retrieved'
    );
  },

  getOrders: async (): Promise<ApiResponse<PharmacyOrder[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/pharmacy/orders'),
      () => getStoredOrders(),
      'Orders retrieved'
    );
  },

  createOrder: async (payload: {
    items: CartItem[];
    deliveryAddress: string;
    paymentMethod: any;
    prescriptionUploaded?: boolean;
  }): Promise<ApiResponse<PharmacyOrder>> => {
    const invalid = validateCheckout(payload.items, payload.deliveryAddress);
    if (invalid) throw new Error(invalid);
    return executeWithFallback(
      () => apiClient.post('/api/v1/pharmacy/orders', payload),
      () => {
        const subtotal = payload.items.reduce(
          (acc, item) => acc + (item.medicine.discountPrice || item.medicine.price) * item.quantity,
          0
        );
        const discount = 0;
        const deliveryFee = subtotal > 30 ? 0 : 4.99;
        const finalTotal = Math.round((subtotal - discount + deliveryFee) * 100) / 100;

        const newOrder: PharmacyOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: `HC-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: getDemoSession()?.id ?? 'demo-patient',
          items: payload.items,
          totalAmount: subtotal,
          discountAmount: discount,
          deliveryFee,
          finalAmount: finalTotal,
          deliveryAddress: payload.deliveryAddress,
          prescriptionUploaded: payload.prescriptionUploaded,
          status: 'CONFIRMED',
          paymentMethod: payload.paymentMethod,
          createdAt: new Date().toISOString(),
          estimatedDeliveryTime: 'Tomorrow by 2:00 PM',
          timeline: [
            {
              status: 'CREATED',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              description: 'Order placed successfully',
            },
            {
              status: 'CONFIRMED',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              description: 'Demo order confirmed; no payment processed',
            },
            {
              status: 'PHARMACY_PROCESSING',
              timestamp: 'Next',
              description: 'Sent to partner dispensary',
            },
          ],
        };

        const current = getStoredOrders();
        const updated = [newOrder, ...current];
        try {
          localStorage.setItem(demoStorageKey(ORDERS_STORAGE_KEY), JSON.stringify(updated));
        } catch {
          throw new Error('The order could not be saved in this browser.');
        }
        return newOrder;
      },
      'Order placed successfully'
    );
  },
};
