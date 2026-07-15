import { User } from "./user";

// lib/api/types/student.ts
export type Industry =
  | 'finance_and_banking'
  | string; // placeholder — send the full choices list when available, I'll lock this to a strict union

export type ReferralSource =
  | 'friend'
  | string; // same as above — placeholder until full choices are known

export interface StudentProfile {
  id: number;
  user: User;
  phone: string;
  country: string; // ISO country code, e.g. "NG" — could type as CountryCode union if you want strict validation
  location: string;
  org_name: string;
  position: string;
  years_of_experience: number;
  industry: Industry;
  referral_source: ReferralSource;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// lib/api/types/student.ts (add)
export interface UpdateStudentProfileRequest {
  phone: string;
  country: string;
  location: string;
  org_name: string;
  position: string;
  years_of_experience: number;
  industry: Industry;
  referral_source: ReferralSource;
}

export type PatchStudentProfileRequest = Partial<UpdateStudentProfileRequest>;