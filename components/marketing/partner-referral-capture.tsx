"use client";

import { useEffect } from "react";
import { persistPartnerSlug } from "@/lib/referral-partner-session";

// Reads `?referral_partner=<slug>` off the landing URL and persists it. Deliberately parses
// window.location.search directly instead of useSearchParams() — that hook needs a Suspense
// boundary and would opt the whole app shell out of static rendering; this only ever needs to run
// once, on first mount, which a plain effect already gives us for free.
export function PartnerReferralCapture() {
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("referral_partner");
    if (slug) persistPartnerSlug(slug);
  }, []);

  return null;
}
