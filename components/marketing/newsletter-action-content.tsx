"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useConfirmNewsletter, useUnsubscribeNewsletter } from "@/hooks/mutations/blog";
import { Button } from "@/components/ui/button";
import { ConfirmShell, ConfirmSpinner } from "@/components/marketing/checkout-confirm-shell";

// Runs once on arrival from an emailed link. The ref guards React's dev-only double mount so the
// token isn't spent twice.
export function NewsletterActionContent({ mode, token }: { mode: "confirm" | "unsubscribe"; token: string }) {
  const confirm = useConfirmNewsletter();
  const unsubscribe = useUnsubscribeNewsletter();
  const fired = useRef(false);
  const isConfirm = mode === "confirm";
  const action = isConfirm ? confirm : unsubscribe;

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (isConfirm) confirm.mutate(token);
    else unsubscribe.mutate(token);
    // Only the token and mode should trigger this; the mutation objects are stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isConfirm]);

  return (
    <ConfirmShell>
      {action.isPending && (
        <>
          <ConfirmSpinner />
          <p className="mt-4 text-sm text-gray-500">One moment…</p>
        </>
      )}

      {action.isSuccess && isConfirm && (
        <>
          <h1 className="mt-8 text-xl font-semibold text-gray-900">You&apos;re subscribed</h1>
          <p className="mt-2 text-sm text-gray-500">
            Thanks for confirming. Expect our latest career insights in your inbox.
          </p>
        </>
      )}
      {action.isSuccess && !isConfirm && (
        <>
          <h1 className="mt-8 text-xl font-semibold text-gray-900">You&apos;ve been unsubscribed</h1>
          <p className="mt-2 text-sm text-gray-500">You won&apos;t receive newsletter emails from us anymore.</p>
        </>
      )}
      {action.isError && (
        <>
          <h1 className="mt-8 text-xl font-semibold text-gray-900">
            {isConfirm ? "We couldn't confirm that link" : "We couldn't update that link"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">{action.error.message}</p>
        </>
      )}

      <Link href="/" className="mt-6 w-full">
        <Button className="w-full">Back to CareerCentra</Button>
      </Link>
    </ConfirmShell>
  );
}
