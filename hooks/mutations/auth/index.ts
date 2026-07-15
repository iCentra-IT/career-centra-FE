// lib/api/auth/use-register.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";
import {
  changePassword,
  confirmPasswordReset,
  loginUser,
  logoutUser,
  registerStudent,
  requestPasswordReset,
} from "@/lib/api/auth";
import { NormalizedError } from "@/types/api";
import { getRefreshToken, useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/router";

export function useRegister() {
  return useMutation<RegisterResponse, NormalizedError, RegisterRequest>({
    mutationFn: registerStudent,
  });
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<LoginResponse, NormalizedError, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth({ user: data.user, access: data.access, refresh: data.refresh });
      router.push(
        data.user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      );
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
      router.push("/signin");
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
