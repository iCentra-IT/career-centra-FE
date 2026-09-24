// lib/api/types/referral-partner.ts
//
// A "referral partner" links a Coupon to a public-facing identity (name, slug, contact email) so
// a partner's members can be routed to a dedicated catalog via
// GET /api/programs/?referral_partner=<slug> and get the partner's discount applied at checkout
// via the underlying coupon's code. Admin/staff only to manage; the slug is the public-facing bit.
import type { CreateCouponRequest } from "./coupon";

export interface ReferralPartner {
  id: number;
  name: string;
  slug: string;
  coupon_code: string; // the underlying coupon's code — read-only here, set via `coupon` on write
  contact_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Links an EXISTING coupon (by id) to a new partner wrapper. Prefer
// OnboardReferralPartnerRequest below when the coupon doesn't exist yet — it creates both in one
// call instead of requiring a separate POST /api/coupons/admin/coupons/ first.
export interface CreateReferralPartnerRequest {
  name: string;
  slug: string;
  coupon: number;
  contact_email: string;
  is_active: boolean;
}

export type PatchReferralPartnerRequest = Partial<CreateReferralPartnerRequest>;

// The coupon shape embedded in POST /api/coupons/admin/partners/onboard/ — now confirmed
// identical to the plain CreateCouponRequest (types/coupon.ts), including max_uses_per_user and
// program_discounts, which were originally only seen here but are now confirmed on the plain
// coupon endpoints too.
export type OnboardPartnerCoupon = CreateCouponRequest;

// POST /api/coupons/admin/partners/onboard/ — creates the Coupon and the ReferralPartner wrapper
// together. Returns the same shape as ReferralPartner.
export interface OnboardReferralPartnerRequest {
  name: string;
  slug: string;
  contact_email: string;
  is_active: boolean;
  coupon: OnboardPartnerCoupon;
}
