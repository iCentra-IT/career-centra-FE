// Captures a referral partner slug from `?referral_partner=<slug>` on first landing and persists
// it in localStorage so it survives navigation across the whole session. lib/api/client.ts's
// request interceptor reads it back and attaches it as `X-Partner-Referral` on every
// programs/cart/checkout request, so the backend applies the partner's discount automatically —
// no coupon code needs to be entered manually.
const STORAGE_KEY = "cc_referral_partner";

export function getPersistedPartnerSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistPartnerSlug(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // localStorage can be unavailable (privacy mode) — the header just won't be sent.
  }
}
