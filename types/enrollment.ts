// lib/api/types/enrollment.ts

import { DashboardStats, StudentCourse } from "./student";
import type { CartCurrency } from "./cart";
import type { ProgramReferralPricing } from "./programs";

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
  cohort_ids?: number[]; // the endpoint takes a list even for a single-cohort "Enrol now"
  coupon_code?: string; // empty string if none applied
  // Omit for a training-only purchase — backward compatible.
  addon_selections?: { cohort_id: number; addon_ids: number[] }[];
  // Add-ons bought on their own, with no cohort (e.g. a question bank or exam fee).
  standalone_addon_ids?: number[];
  // Defaults to the buyer's saved currency, then geo-detection (NGN in Africa, USD elsewhere).
  currency?: CartCurrency;
  // Fallback buyer country (ISO 3166-1 alpha-2) when it can't be geo-detected.
  country_code?: string;
}

// Confirmed against the live OpenAPI schema — order_id/enrollment_ids are always present (the
// earlier optional/legacy-singular shape here predated the real response).
export interface CheckoutInitiateResponse {
  order_id: number;
  enrollment_ids: number[];
  payment_reference: string;
  gateway: PaymentGateway;
  gateway_url: string; // redirect target for the payment gateway checkout page
  currency: string; // the currency actually charged (a pinned referral can override the request)
  referral: ProgramReferralPricing | null;
  original_total: string; // pre-coupon total in the charged currency
  discount_amount: string; // original_total - total_amount
  total_amount: string; // what the gateway actually collects
}

// The gateway's own redirect back to us lands on /api/checkout/confirm/ with gateway-specific
// params: Flutterwave sends ?status=&tx_ref=&transaction_id=, Stripe sends ?session_id=&ref=.
// tx_ref / ref are both the same value we got back as payment_reference from
// /api/checkout/initiate/ (or /api/cart/checkout/) — only one of transaction_id (Flutterwave) or
// session_id (Stripe) is present on a given request.
export interface CheckoutVerifyRequest {
  payment_reference: string;
  transaction_id?: string;
  session_id?: string;
}

export interface StudentEnrollmentsResponse {
  stats: DashboardStats;
  results: StudentCourse[];
}

// PLACEHOLDER — no response sample given, likely returns the Enrollment or a status object
export type CheckoutVerifyResponse = Enrollment | { status: EnrollmentStatus; [key: string]: unknown };

// lib/api/types/admin-enrollment.ts — confirmed real shape from GET /api/admin/enrollments/

export interface AdminEnrollment {
  id: number;
  learner_name: string;
  learner_email: string;
  program_title: string;
  cohort_starts_on: string;
  amount_paid: string;
  currency: string;
  status: EnrollmentStatus;
  payment_gateway: PaymentGateway;
  created_at: string;
}