"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useUnsubscribe } from "@/hooks/mutations/crm";

// The GET itself performs the opt-out (the token is looked up against both leads and users), so
// this fires once on arrival. The ref guards against React's dev-only double-mount firing it twice.
export function UnsubscribeContent({ token }: { token: string }) {
  const unsubscribe = useUnsubscribe();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    unsubscribe.mutate(token);
    // unsubscribe.mutate is stable across renders; only the token should trigger a fresh call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      {unsubscribe.isPending && <p className="text-sm text-gray-500">Updating your preferences…</p>}
      {unsubscribe.isSuccess && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">You&apos;re unsubscribed</h1>
          <p className="mt-3 text-sm text-gray-500">
            You won&apos;t receive any more campaign emails from CareerCentra. Changed your mind? You can
            always subscribe again from our site.
          </p>
        </>
      )}
      {unsubscribe.isError && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">We couldn&apos;t update that link</h1>
          <p className="mt-3 text-sm text-gray-500">{unsubscribe.error.message}</p>
        </>
      )}
      <Link href="/" className="mt-8 inline-flex text-sm font-medium text-secondary hover:underline">
        Back to CareerCentra
      </Link>
    </div>
  );
}
