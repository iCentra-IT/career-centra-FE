// lib/store/dashboard-chrome-store.ts
//
// Shared, session-only UI state for the dashboard shell (admin/students/facilitators). The
// sidebar and header live in separate components rendered side by side by each layout, so a
// tiny store is the simplest way for the header's hamburger button to open/close the sidebar's
// mobile drawer without prop-drilling through three near-identical layout files.
import { create } from "zustand";

interface DashboardChromeState {
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const useDashboardChromeStore = create<DashboardChromeState>((set) => ({
  mobileSidebarOpen: false,
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
}));
