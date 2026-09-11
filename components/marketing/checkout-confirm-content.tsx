"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useVerifyCheckout } from "@/hooks/mutations/enrollment";
import { Button } from "@/components/ui/button";
import { CartOrderConfirm } from "@/components/marketing/cart-order-confirm";
import { ConfirmShell, ConfirmSpinner } from "@/components/marketing/checkout-confirm-shell";

// The payment gateway redirects the browser back here after every checkout. A cart checkout
// stashes its order id in sessionStorage just before redirecting, so if that's present we track
// the order; otherwise this was the single-cohort "Enrol now" flow and we verify by reference.
export function CheckoutConfirmContent(props: {
  status?: string;
  txRef?: string;
  transactionId?: string;
}) {
  const [orderId] = useState<number | null>(() => {
    try {
      const raw = sessionStorage.getItem("checkout_order_id");
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });

  if (orderId && Number.isFinite(orderId)) {
    return <CartOrderConfirm orderId={orderId} status={props.status} />;
  }
  return <VerifyConfirm {...props} />;
}

type Outcome = "verifying" | "success" | "failed";

function VerifyConfirm({
  status,
  txRef,
  transactionId,
}: {
  status?: string;
  txRef?: string;
  transactionId?: string;
}) {
  const router = useRouter();
  const verifyCheckout = useVerifyCheckout();
  const canVerify = status === "successful" && !!txRef && !!transactionId;
  const [outcome, setOutcome] = useState<Outcome>(canVerify ? "verifying" : "failed");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    // This is the verify-by-reference path, not an order — drop any stale stashed order id.
    try {
      sessionStorage.removeItem("checkout_order_id");
    } catch {
      /* ignore */
    }

    if (!canVerify || !txRef || !transactionId) {
      toast.error(
        status === "cancelled" ? "Payment was cancelled." : "Payment was not completed.",
      );
      return;
    }

    verifyCheckout.mutate(
      { payment_reference: txRef, transaction_id: transactionId },
      {
        onSuccess: () => {
          setOutcome("success");
          toast.success("Payment successful — you're enrolled!");
        },
        onError: (err) => {
          setOutcome("failed");
          toast.error(err.message || "We couldn't confirm your payment.");
        },
      },
    );
    // Runs once on mount with the params the gateway redirected back with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (outcome === "verifying") return;
    const destination =
      outcome === "success" ? "/students/enrolments" : "/students/purchase-history";
    const timer = setTimeout(() => router.replace(destination), 2500);
    return () => clearTimeout(timer);
  }, [outcome, router]);

  return (
    <ConfirmShell>
      {outcome === "verifying" && (
        <>
          <ConfirmSpinner />
          <h1 className="mt-6 text-xl font-semibold text-gray-900">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-gray-500">
            Hang tight while we verify your transaction with the payment provider.
          </p>
        </>
      )}

      {outcome === "success" && (
        <>
          <h1 className="mt-8 text-xl font-semibold text-gray-900">Payment successful</h1>
          <p className="mt-2 text-sm text-gray-500">
            You&apos;re all set — taking you to your enrolments now.
          </p>
          <Link href="/students/enrolments" className="mt-6 w-full">
            <Button className="w-full">Go to My Enrolments</Button>
          </Link>
        </>
      )}

      {outcome === "failed" && (
        <>
          <h1 className="mt-8 text-xl font-semibold text-gray-900">Payment not completed</h1>
          <p className="mt-2 text-sm text-gray-500">
            {status === "cancelled"
              ? "You cancelled the payment before it completed."
              : "We couldn't confirm this transaction. Check your purchase history or try again."}
          </p>
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
        </>
      )}
    </ConfirmShell>
  );
}
