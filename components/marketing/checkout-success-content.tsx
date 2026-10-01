"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { CartOrderConfirm } from "@/components/marketing/cart-order-confirm";
import { ConfirmShell } from "@/components/marketing/checkout-confirm-shell";
import { clearPersistedPartnerSlug } from "@/lib/referral-partner-session";

// The gateway's redirect_url is the backend itself (/api/checkout/confirm/, confirmed live), which
// verifies the payment server-side and only then 302s the browser on to here — so unlike the old
// tx_ref-based flow, there's nothing left for the frontend to verify. A cart checkout stashed its
// order id in sessionStorage just before redirecting to the gateway; if that's present we show the
// itemized order confirmation, otherwise this was the single-cohort "Enrol Now" flow.
export function CheckoutSuccessContent() {
  const queryClient = useQueryClient();
  const [orderId] = useState<number | null>(() => {
    try {
      const raw = sessionStorage.getItem("checkout_order_id");
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });
  const ranOnce = useRef(false);

  // This screen only renders once the backend has already verified the payment (see the file
  // comment above) — a confirmed purchase, so the referral has done its job and shouldn't keep
  // discounting whatever the visitor buys next.
  useEffect(() => {
    clearPersistedPartnerSlug();
  }, []);

  useEffect(() => {
    if (ranOnce.current || (orderId && Number.isFinite(orderId))) return; // CartOrderConfirm invalidates its own queries
    ranOnce.current = true;
    queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard.enrollments });
    queryClient.invalidateQueries({ queryKey: ["enrollments"] });
  }, [orderId, queryClient]);

  if (orderId && Number.isFinite(orderId)) {
    return <CartOrderConfirm orderId={orderId} status="successful" />;
  }

  return (
    <ConfirmShell>
      <h1 className="mt-8 text-xl font-semibold text-gray-900">Payment successful</h1>
      <p className="mt-2 text-sm text-gray-500">
        You&apos;re all set — taking you to your enrolments now.
      </p>
      <Link href="/students/enrolments" className="mt-6 w-full">
        <Button className="w-full">Go to My Enrolments</Button>
      </Link>
    </ConfirmShell>
  );
}
