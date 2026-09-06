"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useVerifyCheckout } from "@/hooks/mutations/enrollment";
import { Button } from "@/components/ui/button";

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
        <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
        <path
          d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5"
          stroke="#0c236c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-xl font-semibold text-main">iCentra</span>
    </div>
  );
}

type Outcome = "verifying" | "success" | "failed";

export function CheckoutConfirmContent({
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
  // The gateway sends us here on a cancel too (status=cancelled), with nothing to verify —
  // that's known up front from the redirect params, so it's the initial state, not something
  // an effect derives after the fact.
  const canVerify = status === "successful" && !!txRef && !!transactionId;
  const [outcome, setOutcome] = useState<Outcome>(canVerify ? "verifying" : "failed");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

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

  // Give the user a moment to read the outcome, then move them along automatically —
  // the manual buttons below cover anyone who navigates away before the timer fires.
  useEffect(() => {
    if (outcome === "verifying") return;
    const destination = outcome === "success" ? "/students/enrolments" : "/students/purchase-history";
    const timer = setTimeout(() => router.replace(destination), 2500);
    return () => clearTimeout(timer);
  }, [outcome, router]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(12,35,108,0.08) 1.5px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <Logo />

        {outcome === "verifying" && (
          <>
            <span
              className="mt-8 h-8 w-8 animate-spin rounded-full border-2 border-main/20 border-t-main"
              aria-hidden="true"
            />
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
      </div>
    </div>
  );
}
