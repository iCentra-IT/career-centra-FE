// lib/api/types/auth.ts
import { Industry, ReferralSource, StudentProfile } from './student';
import { User } from './user';

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string; // confirm password
  phone: string;
  location: string;
  org_name: string;
  position: string;
  years_of_experience: number;
  industry: Industry;
  referral_source: ReferralSource;
}

export type RegisterResponse = StudentProfile; // matches the "data" you gave earlier

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface UpdateProfileRequest {
  email: string;
  first_name: string;
  last_name: string;
  // UNCONFIRMED — see the matching note on User.avatar_url in types/user.ts. Omit to leave an
  // existing avatar untouched on a PATCH.
  avatar?: File;
}

export type UpdateProfileResponse = User;
export type PatchProfileRequest = Partial<UpdateProfileRequest>;

export interface LogoutRequest {
  refresh: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  email: string;
  otp: string;
  new_password: string;
  new_password2: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// PLACEHOLDER — no response sample given; treat any 2xx as success and just show a generic message.
export type VerifyEmailResponse = { message?: string } | null;

export interface StaffAcceptInviteRequest {
  token: string;
  password: string;
  password2: string;
}

// PLACEHOLDER — no response sample given; treat any 2xx as success.
export type StaffAcceptInviteResponse = { message?: string } | null;

export interface DeactivateAccountRequest {
  password: string;
}