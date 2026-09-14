// lib/api/auth/register.ts
import {
  ChangePasswordRequest,
  DeactivateAccountRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PatchProfileRequest,
  RegisterRequest,
  RegisterResponse,
  StaffAcceptInviteRequest,
  StaffAcceptInviteResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/auth";
import { apiClient } from "../client";
import { ApiResponse, unwrapObject } from "@/types/api";
import { toRequestBody } from "../form-data";
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
  const { body, headers } = toRequestBody(payload);
  const { data } = await apiClient.put<ApiResponse<UpdateProfileResponse>>(
    "/api/auth/me/",
    body,
    headers ? { headers } : undefined,
  );
  return data.data;
}

export async function patchProfile(
  payload: PatchProfileRequest,
): Promise<UpdateProfileResponse> {
  const { body, headers } = toRequestBody(payload);
  const { data } = await apiClient.patch<ApiResponse<UpdateProfileResponse>>(
    "/api/auth/me/",
    body,
    headers ? { headers } : undefined,
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

// Activates an account using the signed token emailed on registration. Public — no auth header needed.
export async function verifyEmail(
  payload: VerifyEmailRequest,
): Promise<VerifyEmailResponse> {
  const { data } = await apiClient.post("/api/auth/verify-email/", payload);
  return unwrapObject<VerifyEmailResponse>(data);
}

// Validates a staff/staff-admin invite token and sets the invitee's password, activating the account.
export async function acceptStaffInvite(
  payload: StaffAcceptInviteRequest,
): Promise<StaffAcceptInviteResponse> {
  const { data } = await apiClient.post("/api/auth/staff/accept-invite/", payload);
  return unwrapObject<StaffAcceptInviteResponse>(data);
}

// Deactivates (soft-deletes) the current user's account after confirming their password.
export async function deactivateAccount(
  payload: DeactivateAccountRequest,
): Promise<void> {
  await apiClient.post("/api/auth/me/deactivate/", payload);
}
