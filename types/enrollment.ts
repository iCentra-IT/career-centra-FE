// lib/api/types/enrollment.ts

import { DashboardStats, StudentCourse } from "./student";

export type EnrollmentStatus = 'pending' | string; 
// ^ only one value seen — likely also "active"/"completed"/"failed"/"cancelled", send full list when known

export type PaymentGateway = 'flutterwave' | string; 
// ^ likely also "paystack" given your stack — confirm

export interface EnrollmentProgramSummary {
  id: number;
  title: string;
  slug: string;
}

export interface EnrollmentCohortSummary {
  id: number;
  starts_on: string; // date, not datetime
  ends_on: string;
  facilitator_name: string;
}

// List item — lighter payload
export interface EnrollmentListItem {
  id: number;
  program: EnrollmentProgramSummary;
  cohort: EnrollmentCohortSummary;
  amount_paid: string; // decimal-as-string, same pattern as prices
  currency: string;
  status: EnrollmentStatus;
  created_at: string;
}

// Detail — adds usd amount, payment reference/gateway, updated_at
export interface Enrollment extends Omit<EnrollmentListItem, never> {
  amount_paid_usd: string;
  payment_reference: string;
  payment_gateway: PaymentGateway;
  updated_at: string;
}

export interface EnrollmentReceipt {
  id: number;
  payment_reference: string;
  user_full_name: string;
  user_email: string;
  program_title: string;
  cohort_starts_on: string;
  cohort_ends_on: string;
  amount_paid: string;
  currency: string;
  amount_paid_usd: string;
  payment_gateway: PaymentGateway;
  status: EnrollmentStatus;
  created_at: string;
}

// lib/api/types/checkout.ts

export interface CheckoutInitiateRequest {
  cohort_id: number;
  country_code: string; // e.g. "NG"
  currency: string; // "NGN" | "USD"
  coupon_code: string; // empty string if none applied
}

// PLACEHOLDER — no response sample given. Given payment_gateway values seen elsewhere
// (flutterwave), this likely returns a redirect/authorization URL. Send the actual
// response before I build the hook meaningfully — this one really matters since it
// drives the redirect-to-payment-gateway UX.
export interface CheckoutInitiateResponse {
  authorization_url?: string;
  payment_reference?: string;
  [key: string]: unknown;
}

export interface CheckoutVerifyRequest {
  payment_reference: string;
  transaction_id: string;
  session_id: string;
}

export interface StudentEnrollmentsResponse {
  stats: DashboardStats;
  results: StudentCourse[];
}

// PLACEHOLDER — no response sample given, likely returns the Enrollment or a status object
export type CheckoutVerifyResponse = Enrollment | { status: EnrollmentStatus; [key: string]: unknown };