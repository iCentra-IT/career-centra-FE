// lib/store/auth-store.ts
import { User } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (params: { user: User; access: string; refresh: string }) => void;
  setTokens: (params: { access: string; refresh: string }) => void; // renamed from setAccessToken
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, access, refresh }) =>
        set({ user, accessToken: access, refreshToken: refresh }),
      setTokens: ({ access, refresh }) =>
        set({ accessToken: access, refreshToken: refresh }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "auth-storage" },
  ),
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const getRefreshToken = () => useAuthStore.getState().refreshToken;
// Only pages that need a logged-in session send the visitor to login. A stale token on a public
// page (program details, blog, etc.) just drops the session — the page itself still loads.
const LOGIN_REQUIRED_PREFIXES = ["/admin", "/students", "/facilitators", "/marketer", "/staff", "/orders"];

export const handleUnauthorized = () => {
  useAuthStore.getState().clearAuth();
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (LOGIN_REQUIRED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    window.location.href = "/login";
  }
};
