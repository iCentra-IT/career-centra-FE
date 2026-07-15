// lib/api/types/coupon.ts

export type DiscountType = 'percentage' | string; 
// ^ only one value seen — likely also "fixed_amount" or similar, send full choices when available

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string; // decimal-as-string, same pattern as program prices — keep as string
  currency: string; // e.g. "NGN" — confirm if this is a fixed set (NGN/USD) or free text
  max_uses: number;
  uses_count: number;
  valid_from: string; // ISO datetime
  valid_until: string; // ISO datetime
  is_active: boolean;
  applicable_program_ids: number[];
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