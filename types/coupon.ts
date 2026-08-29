// lib/api/types/coupon.ts

export type DiscountType = 'percentage' | 'fixed_amount' | string;

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string; // decimal-as-string, same pattern as program prices — keep as string
  currency: string; // empty string for percentage coupons; "USD"/"NGN" etc for fixed_amount ones
  max_uses: number | null; // null seen — unlimited uses
  uses_count: number;
  valid_from: string | null; // ISO datetime, null seen — no start restriction
  valid_until: string | null; // ISO datetime, null seen — no expiry
  is_active: boolean;
  applicable_program_ids: number[]; // empty array seen — applies to all programs
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
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_program_ids: number[];
}

export type PatchCouponRequest = Partial<CreateCouponRequest>;

// lib/api/types/coupon-validate.ts

export interface ValidateCouponRequest {
  code: string;
  program_id: number;
  currency: string; // e.g. "NGN" | "USD"
  amount: string; // decimal-as-string, matching the price field pattern
}

// PLACEHOLDER — you didn't include a response sample for this one.
// I need the actual validate response before building the hook meaningfully.
// Likely shape based on typical coupon-validation APIs:
export interface ValidateCouponResponse {
  valid: boolean;
  discount_amount?: string;
  final_amount?: string;
  message?: string;
}