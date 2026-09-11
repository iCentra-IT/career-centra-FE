// lib/store/cart-store.ts
//
// GUEST cart only. Logged-out shoppers can add cohorts before signing in; this holds a rich
// snapshot purely for display. On login the cohort ids are POSTed to /api/cart/merge/ and this
// store is cleared — from then on the server cart (useCart) is the source of truth.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  programId: number;
  slug: string;
  title: string;
  summary: string;
  badge: string;
  code: string;
  priceAmount: string;
  priceCurrency: string;
  cohortId: number;
  cohortStartsOn: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cohortId: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.cohortId === item.cohortId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (cohortId) =>
        set((state) => ({ items: state.items.filter((item) => item.cohortId !== cohortId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage" },
  ),
);

export const guestCartCohortIds = () =>
  useCartStore.getState().items.map((i) => i.cohortId);
