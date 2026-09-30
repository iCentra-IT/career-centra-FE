import type { Metadata } from "next";
import { CheckoutFailedContent } from "@/components/marketing/checkout-failed-content";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// See app/checkout/success/page.tsx for why this route exists — this is the backend's real
// failure redirect target, confirmed live with reason codes order_not_found, payment_incomplete
// and verification_failed (also carries a `ref` query param, not currently used).
export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; ref?: string }>;
}) {
  const { reason } = await searchParams;
  return <CheckoutFailedContent reason={reason} />;
}
