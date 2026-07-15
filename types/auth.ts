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
  country: string; // ISO code, e.g. "NG" — confirm allowed format when you send the country list, if any
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
  token: string;
  new_password: string;
  new_password2: string;
}