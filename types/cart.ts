// lib/api/types/cart.ts
import { ProgramAccreditation } from "./student";
import type { ProgramReferralPricing } from "./programs";

export type CertificateProvider = "icentra" | "pmi" | "pecb" | "none" | string;
export type OrderStatus = "pending" | "confirmed" | "failed" | string;
export type CheckoutGateway = "stripe" | "flutterwave" | string;

// Currencies the cart endpoint accepts via ?currency= — confirmed list from the spec.
export type CartCurrency = "NGN" | "USD" | "EUR" | "GBP" | "GHS" | "KES";

export interface CartCohortFacilitator {
  full_name: string;
  avatar_url: string;
  credential_tags: string[];
}

// Full cohort summary embedded on both cart lines and order lines.
export interface CartCohortSummary {
  id: number;
  platform: string;
  starts_on: string;
  ends_on: string;
  // Confirmed against the live OpenAPI schema — the field is number_of_class_days, not
  // duration_weeks (that name never matched this endpoint; nothing in the app actually read it).
  number_of_class_days: number;
  delivery_mode: string;
  location: string;
  seat_capacity: number;
  seats_taken: number;
  is_enrollment_open: boolean;
  is_sold_out: boolean;
  is_nearly_full: boolean;
  effective_price_usd: string;
  effective_price_ngn: string;
  default_price: string;
  currency: string;
  facilitator_display: CartCohortFacilitator[];
}

export interface CartProgramSummary {
  id: number;
  title: string;
  slug: string;
  certificate_provider: CertificateProvider;
}

// An add-on attached to one cart line — priced in the cart's currency.
export interface CartAddonLine {
  id: number;
  name: string;
  kind: string;
  amount: string;
  amount_usd: string | null;
}

export interface CartItemLine {
  id: number; // cart item id
  program: CartProgramSummary;
  cohort: CartCohortSummary;
  amount: string | null; // this line in `currency`; null if unavailable
  amount_usd: string | null; // null if not USD-derived
  discount_amount: string; // this line's share of the coupon ("0.00" if none)
  available: boolean;
  unavailable_reason: string | null; // string when available=false
  addons: CartAddonLine[];
  addon_total: string;
}

// One cohort-less add-on sitting directly in the cart (e.g. a Question Bank bought on its own via
// POST /api/cart/standalone-addons/{addon_id}/) — confirmed shape from the live OpenAPI schema.
export interface CartStandaloneAddon {
  id: number; // the cart line's own id — pass addon_id (below), not this, back to the API
  addon_id: number;
  program: CartProgramSummary;
  name: string;
  kind: string;
  amount: string | null;
  amount_usd: string | null;
  available: boolean;
  unavailable_reason: string | null;
}

export interface CartCoupon {
  code: string;
  applied: boolean;
  discount_amount: string;
  error: string | null; // reason string when applied=false
}

export interface Cart {
  currency: string; // resolved display currency
  country_code: string; // resolved buyer country
  referral: ProgramReferralPricing | null; // null unless a partner referral is pinned
  item_count: number;
  subtotal: string; // sum of item amounts, PRE-discount
  subtotal_usd: string | null; // null if any item isn't USD-priced
  discount_amount: string; // "0.00" if no/invalid coupon
  addon_total: string; // cohort-line add-ons — never discounted by a coupon
  addon_total_usd: string | null;
  standalone_addons: CartStandaloneAddon[]; // add-ons bought with no cohort at all
  standalone_addon_total: string;
  standalone_addon_total_usd: string | null;
  total: string; // subtotal - discount_amount + addon_total + standalone_addon_total
  coupon: CartCoupon | null; // null unless ?coupon= was passed
  items: CartItemLine[];
}

export interface SetCartAddonsRequest {
  addon_ids: number[];
}

export interface AddToCartRequest {
  cohort_id: number;
}

export interface CartCountResponse {
  count: number;
}

// Replays an anonymous visitor's locally-stored cart after sign-in/sign-up. `items` (cohort + its
// own add-on selection) is the full shape; `cohort_ids` is the legacy cohorts-only form, still
// accepted alongside it. At least one of cohort_ids/items/standalone_addon_ids must be non-empty.
// Best-effort: a cohort is added if purchasable regardless of its add-ons — an addon_id that
// doesn't apply (wrong programme, or it loses a selection-group conflict) is just left out, never
// a reason to skip the cohort. Each standalone add-on is reported added/skipped independently in
// the response's `merged` breakdown.
export interface MergeGuestCartRequest {
  cohort_ids?: number[];
  items?: { cohort_id: number; addon_ids?: number[] }[];
  standalone_addon_ids?: number[];
}

// Merge returns the Cart plus a best-effort `merged` breakdown of what was / wasn't added.
export interface MergeGuestCartResponse extends Cart {
  merged?: {
    added?: number[];
    skipped?: Record<string, string>;
    standalone_addons_added?: number[];
    standalone_addons_skipped?: Record<string, string>;
  };
}

export interface CartCheckoutRequest {
  currency?: string;
  country_code?: string;
  coupon_code?: string;
}

export interface CartCheckoutResponse {
  order_id: number;
  enrollment_ids: number[];
  payment_reference: string;
  gateway: CheckoutGateway;
  gateway_url: string; // redirect the buyer here
  currency: string; // the currency actually charged (a pinned referral can override the request)
  referral: ProgramReferralPricing | null;
  original_total: string; // pre-coupon total in the charged currency
  discount_amount: string; // original_total - total_amount
  total_amount: string; // what the gateway actually collects
}

// 400 body when one or more cohorts can't be checked out.
export interface CartCheckoutItemErrors {
  detail: string;
  item_errors: Record<string, string>; // { "<cohort_id>": "<reason>" }
}

// ---- Orders (confirmation / receipt screen) ----

export interface OrderCoupon {
  code: string;
  discount_type: string; // "percentage" | "fixed" | ...
  discount_value: string;
}

export interface OrderProgramSummary {
  id: number;
  title: string;
  slug: string;
  program_type: string;
  summary: string;
  cover_image_url: string;
  accreditations: ProgramAccreditation[];
}

export interface OrderItem {
  id: number; // enrollment id
  program: OrderProgramSummary;
  cohort: CartCohortSummary;
  amount_paid: string; // this line, post-discount
  amount_paid_usd: string;
  currency: string;
  original_amount: string | null; // pre-discount; null if no coupon hit this line
  discount_amount: string | null; // null if no coupon hit this line
  status: OrderStatus;
}

export interface Order {
  id: number;
  payment_reference: string;
  status: OrderStatus; // pending | confirmed | failed
  currency: string;
  country_code: string;
  detected_currency: string;
  total_amount: string; // what the buyer pays, post-discount
  total_amount_usd: string | null;
  discount_total: string; // sum of line discounts
  coupon: OrderCoupon | null;
  payment_gateway: CheckoutGateway;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}
