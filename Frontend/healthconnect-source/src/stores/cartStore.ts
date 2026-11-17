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
  items: [],
  isDrawerOpen: false,

  addItem: (medicine, quantity = 1) => {
    if (!medicine.inStock || !Number.isInteger(quantity) || quantity < 1) return;
    set((state) => {
      const existing = state.items.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.medicine.id === medicine.id
              ? { ...item, quantity: Math.min(item.medicine.stockCount, item.quantity + quantity) }
              : item
          ),
          isDrawerOpen: true,
        };
      }
      return {
        items: [...state.items, { medicine, quantity: Math.min(quantity, medicine.stockCount) }],
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
    if (!Number.isInteger(quantity)) return;
    if (quantity <= 0) {
      get().removeItem(medicineId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity: Math.min(quantity, item.medicine.stockCount) } : item
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
      const price = item.medicine.discountPrice ?? item.medicine.price;
      return total + price * item.quantity;
    }, 0);
  },
}));
