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

// A cohort-less add-on picked before sign-in. Snapshot purely for display here (same as CartItem)
// — the real, cohort-independent price is resolved server-side once /api/cart/merge/ adds it for
// real after login.
export interface GuestStandaloneAddon {
  addonId: number;
  programSlug: string;
  programTitle: string;
  name: string;
  priceAmount: string;
  priceCurrency: string;
}

interface CartState {
  items: CartItem[];
  standaloneAddons: GuestStandaloneAddon[];
  addItem: (item: CartItem) => void;
  removeItem: (cohortId: number) => void;
  addStandaloneAddon: (addon: GuestStandaloneAddon) => void;
  removeStandaloneAddon: (addonId: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      standaloneAddons: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.cohortId === item.cohortId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (cohortId) =>
        set((state) => ({ items: state.items.filter((item) => item.cohortId !== cohortId) })),
      addStandaloneAddon: (addon) =>
        set((state) => {
          if (state.standaloneAddons.some((a) => a.addonId === addon.addonId)) return state;
          return { standaloneAddons: [...state.standaloneAddons, addon] };
        }),
      removeStandaloneAddon: (addonId) =>
        set((state) => ({
          standaloneAddons: state.standaloneAddons.filter((a) => a.addonId !== addonId),
        })),
      clear: () => set({ items: [], standaloneAddons: [] }),
    }),
    { name: "cart-storage" },
  ),
);

export const guestCartCohortIds = () =>
  useCartStore.getState().items.map((i) => i.cohortId);

export const guestCartStandaloneAddonIds = () =>
  useCartStore.getState().standaloneAddons.map((a) => a.addonId);
