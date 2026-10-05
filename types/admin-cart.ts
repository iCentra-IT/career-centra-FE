// lib/api/types/admin-cart.ts
// GET /api/admin/carts/ (list) and GET /api/admin/carts/{user_id}/ (one learner's cart) — admin,
// staff-admin and marketer, read-only. The detail is the regular cart shape plus `user` and the
// partner `referral` block, confirmed by a real sample.
import type { ProgramReferralPricing } from "./programs";
import type { Cart } from "./cart";

export interface AdminCartUserRef {
  id: number;
  email: string;
  full_name: string;
}

// One row of the list endpoint. `cohorts` is only shown as a generic placeholder in the sample, so
// only its length is used on screen.
export interface AdminCartSummary {
  id: number;
  user: AdminCartUserRef;
  item_count: number;
  cohorts: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface AdminUserCart extends Cart {
  user: AdminCartUserRef;
  referral?: ProgramReferralPricing | null;
}
