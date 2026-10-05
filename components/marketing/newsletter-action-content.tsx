"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useConfirmNewsletter, useUnsubscribeNewsletter } from "@/hooks/mutations/blog";

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
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      {action.isPending && <p className="text-sm text-gray-500">One moment…</p>}

      {action.isSuccess && isConfirm && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">You&apos;re subscribed</h1>
          <p className="mt-3 text-sm text-gray-500">
            Thanks for confirming. Expect our latest career insights in your inbox.
          </p>
        </>
      )}
      {action.isSuccess && !isConfirm && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">You&apos;ve been unsubscribed</h1>
          <p className="mt-3 text-sm text-gray-500">You won&apos;t receive newsletter emails from us anymore.</p>
        </>
      )}
      {action.isError && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isConfirm ? "We couldn't confirm that link" : "We couldn't update that link"}
          </h1>
          <p className="mt-3 text-sm text-gray-500">{action.error.message}</p>
        </>
      )}

      <Link href="/" className="mt-8 inline-flex text-sm font-medium text-secondary hover:underline">
        Back to CareerCentra
      </Link>
    </div>
  );
}
