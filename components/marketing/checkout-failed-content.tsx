"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CartOrderConfirm } from "@/components/marketing/cart-order-confirm";
import { ConfirmShell } from "@/components/marketing/checkout-confirm-shell";

// Confirmed live from the backend's own /api/checkout/confirm/ redirect — the three codes it
// actually sends today. Falls back to a generic message for anything not listed here so a new
// backend reason code never shows a blank/undefined string.
const REASON_MESSAGES: Record<string, string> = {
  order_not_found: "We couldn't find this order. It may have already been processed, or the link has expired.",
  payment_incomplete: "The payment wasn't completed — it looks like it was cancelled before finishing.",
  verification_failed: "We couldn't confirm this transaction with the payment provider.",
};

function reasonMessage(reason?: string) {
  return (reason && REASON_MESSAGES[reason]) || "We couldn't confirm this transaction. Check your purchase history or try again.";
}

// Mirrors CheckoutSuccessContent: the backend has already determined this checkout failed (and
// why — `reason`) before sending the browser here, so there's nothing left to verify client-side.
export function CheckoutFailedContent({ reason }: { reason?: string }) {
  const [orderId] = useState<number | null>(() => {
    try {
      const raw = sessionStorage.getItem("checkout_order_id");
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current || (orderId && Number.isFinite(orderId))) return; // CartOrderConfirm shows its own toast
    ranOnce.current = true;
    toast.error(reasonMessage(reason));
  }, [orderId, reason]);

  if (orderId && Number.isFinite(orderId)) {
    return <CartOrderConfirm orderId={orderId} status="failed" />;
  }

  return (
    <ConfirmShell>
      <h1 className="mt-8 text-xl font-semibold text-gray-900">Payment not completed</h1>
      <p className="mt-2 text-sm text-gray-500">{reasonMessage(reason)}</p>
      <div className="mt-6 flex w-full flex-col gap-3">
        <Link href="/students/purchase-history" className="w-full">
          <Button className="w-full">View Purchase History</Button>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Homepage
        </Link>
      </div>
    </ConfirmShell>
  );
}
