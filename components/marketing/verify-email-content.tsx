"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useVerifyEmail } from "@/hooks/mutations/auth";
import { Button } from "@/components/ui/button";

type Outcome = "verifying" | "success" | "failed";

export function VerifyEmailContent({ token }: { token?: string }) {
  const verifyEmail = useVerifyEmail();
  const [outcome, setOutcome] = useState<Outcome>(token ? "verifying" : "failed");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current || !token) return;
    ranOnce.current = true;

    verifyEmail.mutate(
      { token },
      {
        onSuccess: () => {
          setOutcome("success");
          toast.success("Email verified.");
        },
        onError: (err) => {
          setOutcome("failed");
          toast.error(err.message || "We couldn't verify this link.");
        },
      },
    );
    // Runs once on mount with the token the email link carried.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (outcome === "verifying") {
    return (
      <div className="text-center">
        <span
          className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-main/20 border-t-main"
          aria-hidden="true"
        />
        <h1 className="mt-6 text-2xl font-semibold text-gray-900">Verifying your email…</h1>
        <p className="mt-2 text-sm text-gray-500">Just a moment while we confirm your address.</p>
      </div>
    );
  }

  if (outcome === "success") {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Email verified</h1>
        <p className="mt-2 text-sm text-gray-500">Your account is active — you can log in now.</p>
        <Link href="/login" className="mt-6 block">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Verification link invalid</h1>
      <p className="mt-2 text-sm text-gray-500">
        {token
          ? "This link has expired or has already been used."
          : "This link is missing its verification token."}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/login" className="block">
          <Button className="w-full">Go to Login</Button>
        </Link>
        <Link href="/contact" className="text-sm text-secondary hover:underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}
