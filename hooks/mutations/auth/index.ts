// lib/api/auth/use-register.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PatchProfileRequest,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileResponse,
} from "@/types/auth";
import {
  changePassword,
  confirmPasswordReset,
  loginUser,
  logoutUser,
  patchProfile,
  registerStudent,
  requestPasswordReset,
} from "@/lib/api/auth";
import { NormalizedError } from "@/types/api";
import { isAdminDashboardRole } from "@/types/user";
import { queryKeys } from "@/lib/api/query-keys";
import { getRefreshToken, useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

export function useRegister() {
  return useMutation<RegisterResponse, NormalizedError, RegisterRequest>({
    mutationFn: registerStudent,
  });
}

export function useLogin(next?: string | null) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<LoginResponse, NormalizedError, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth({ user: data.user, access: data.access, refresh: data.refresh });
      const dashboardHref = isAdminDashboardRole(data.user.role) ? "/admin" : "/students";
      // Only students get sent back to where they left off — everyone else always lands on their dashboard.
      router.push(data.user.role === "student" && next ? next : dashboardHref);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refresh = getRefreshToken();
      if (!refresh) return Promise.resolve();
      return logoutUser({ refresh });
    },
    onSettled: () => {
      // clear regardless of API success/failure — don't trap user in a logged-in UI
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
}

export function useChangePassword() {
  return useMutation<null, NormalizedError, ChangePasswordRequest>({
    mutationFn: changePassword,
  });
}

export function usePasswordReset() {
  return useMutation<null, NormalizedError, PasswordResetRequest>({
    mutationFn: requestPasswordReset,
  });
}

export function usePasswordResetConfirm() {
  return useMutation<null, NormalizedError, PasswordResetConfirmRequest>({
    mutationFn: confirmPasswordReset,
  });
}

export function usePatchProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, NormalizedError, PatchProfileRequest>({
    mutationFn: patchProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
    },
  });
}
