import { create } from 'zustand';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];

  addItem: (restaurantId: string, restaurantName: string, menuItem: MenuItem, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  incrementItem: (menuItemId: string) => void;
  decrementItem: (menuItemId: string) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  items: [],

  addItem: (restaurantId, restaurantName, menuItem, notes) => {
    const state = get();

    // If cart belongs to a different restaurant, clear it first
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      set({ restaurantId, restaurantName, items: [] });
    }

    const existing = state.items.find((i) => i.menuItem.id === menuItem.id);

    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      }));
    } else {
      set((s) => ({
        restaurantId,
        restaurantName,
        items: [...s.items, { menuItem, quantity: 1, notes }],
      }));
    }
  },

  removeItem: (menuItemId) =>
    set((s) => ({
      items: s.items.filter((i) => i.menuItem.id !== menuItemId),
    })),

  incrementItem: (menuItemId) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    })),

  decrementItem: (menuItemId) =>
    set((s) => {
      const item = s.items.find((i) => i.menuItem.id === menuItemId);
      if (!item) return s;
      if (item.quantity <= 1) {
        return { items: s.items.filter((i) => i.menuItem.id !== menuItemId) };
      }
      return {
        items: s.items.map((i) =>
          i.menuItem.id === menuItemId ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      };
    }),

  clearCart: () => set({ restaurantId: null, restaurantName: null, items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + Number(i.menuItem.price) * i.quantity, 0),
}));
