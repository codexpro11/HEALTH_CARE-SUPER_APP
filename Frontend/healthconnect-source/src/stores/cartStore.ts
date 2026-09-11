import { create } from 'zustand';
import { CartItem, Medicine } from '../types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (medicine: Medicine, quantity?: number) => void;
  removeItem: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    // Preload one item so user can immediately see the checkout & cart experience
    {
      medicine: {
        id: 'med-store-01',
        name: 'Atorvastatin 10mg Tablets',
        genericName: 'Atorvastatin Calcium',
        manufacturer: 'Pfizer Labs',
        category: 'CARDIOLOGY',
        price: 24.5,
        discountPrice: 18.0,
        dosageForm: 'Tablet',
        strength: '10mg (30 Tablets)',
        inStock: true,
        stockCount: 140,
        requiresPrescription: true,
        description: 'HMG-CoA reductase inhibitor for reducing LDL cholesterol.',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      },
      quantity: 1,
    },
  ],
  isDrawerOpen: false,

  addItem: (medicine, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.medicine.id === medicine.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          isDrawerOpen: true,
        };
      }
      return {
        items: [...state.items, { medicine, quantity }],
        isDrawerOpen: true,
      };
    });
  },

  removeItem: (medicineId) => {
    set((state) => ({
      items: state.items.filter((item) => item.medicine.id !== medicineId),
    }));
  },

  updateQuantity: (medicineId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(medicineId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.medicine.discountPrice || item.medicine.price;
      return total + price * item.quantity;
    }, 0);
  },
}));
