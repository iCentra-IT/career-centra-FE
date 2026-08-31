// lib/store/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  programId: number;
  slug: string;
  title: string;
  summary: string;
  badge: string;
  code: string;
  priceUsd: string;
  cohortId: number;
  cohortStartsOn: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (programId: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.programId === item.programId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (programId) =>
        set((state) => ({ items: state.items.filter((item) => item.programId !== programId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage" },
  ),
);
