// lib/api/auth/register.ts
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PatchProfileRequest,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@/types/auth";
import { apiClient } from "../client";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";

export async function registerStudent(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    "/api/auth/register/",
    payload,
  );
  return data.data;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/api/auth/login/",
    payload,
  );
  return data.data;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>("/api/auth/me/");
  return data.data; // no .data.data here — this endpoint returns the user directly
}

export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<UpdateProfileResponse> {
  const { data } = await apiClient.put<ApiResponse<UpdateProfileResponse>>(
    "/api/auth/me/",
    payload,
  );
  return data.data;
}

export async function patchProfile(
  payload: PatchProfileRequest,
): Promise<UpdateProfileResponse> {
  const { data } = await apiClient.patch<ApiResponse<UpdateProfileResponse>>(
    "/api/auth/me/",
    payload,
  );
  return data.data;
}

export async function logoutUser(payload: LogoutRequest): Promise<void> {
  await apiClient.post("/api/auth/logout/", payload);
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<null> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/api/auth/me/change-password/",
    payload,
  );
  return data.data;
}

export async function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<null> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/api/auth/password-reset/",
    payload,
  );
  return data.data;
}

export async function confirmPasswordReset(
  payload: PasswordResetConfirmRequest,
): Promise<null> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/api/auth/password-reset/confirm/",
    payload,
  );
  return data.data;
}
