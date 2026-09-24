// lib/api/types/coupon.ts

export type DiscountType = 'percentage' | 'fixed_amount' | string;

export interface CouponApplicableProgram {
  id: number;
  title: string;
  slug: string;
}

// A per-program override of the coupon's blanket discount_value — confirmed real shape from
// GET/POST/PATCH /api/coupons/admin/coupons/ (nested `program` object on read, flat `program_id`
// on write, same split as `applicable_programs`/`applicable_program_ids`).
export interface CouponProgramDiscount {
  id: number;
  program: CouponApplicableProgram;
  discount_value: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string; // decimal-as-string, same pattern as program prices — keep as string
  currency: string; // empty string for percentage coupons; "USD"/"NGN" etc for fixed_amount ones
  max_uses: number | null; // null seen — unlimited uses
  max_uses_per_user: number;
  uses_count: number;
  valid_from: string | null; // ISO datetime, null seen — no start restriction
  valid_until: string | null; // ISO datetime, null seen — no expiry
  is_active: boolean;
  // Confirmed real field name on the response — NOT applicable_program_ids (that's the write-side
  // field only; reading it here always came back undefined and crashed the coupon view modal).
  // Empty array seen — applies to all programs.
  applicable_programs: CouponApplicableProgram[];
  program_discounts: CouponProgramDiscount[];
  created_at: string;
  updated_at: string;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  currency: string;
  max_uses: number;
  max_uses_per_user: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_program_ids: number[];
  program_discounts: { program_id: number; discount_value: string }[];
}

export type PatchCouponRequest = Partial<CreateCouponRequest>;

// lib/api/types/coupon-validate.ts

export interface ValidateCouponRequest {
  code: string;
  program_id: number;
  currency: string; // e.g. "NGN" | "USD"
  amount: string; // decimal-as-string, matching the price field pattern
}

// Confirmed real shape by a live sample. A rejected/invalid code doesn't come back as this shape
// at all — it's a 400 with a plain {detail: "..."} error (see normalizeError in types/api.ts),
// which the caller sees as a thrown NormalizedError, not a `valid: false` response.
export interface ValidateCouponResponse {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  original_amount: string;
  discount_amount: string;
  final_amount: string;
}