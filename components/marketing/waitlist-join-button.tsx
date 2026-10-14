"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useJoinWaitlist } from "@/hooks/mutations/cohort";
import { useWaitlistMembership } from "@/hooks/use-waitlist-membership";

// Logged-in users join with one click (their account email is used server-side).
// Guests get an inline email (+ optional name) form before submitting, since the
// backend needs somewhere to send the "a cohort opened" notification.
export function WaitlistJoinButton({
  programId,
  waitlisted,
  className,
}: {
  programId: number;
  waitlisted?: boolean;
  className?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const joinWaitlist = useJoinWaitlist();
  const { joined: guestJoined, markJoined } = useWaitlistMembership(programId);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [justJoined, setJustJoined] = useState(false);

  // Signed-in users read membership from the program detail payload (server truth, no extra
  // request) — trustworthy, since it's keyed by their actual account. justJoined bridges the gap
  // between a successful POST and the next program refetch, which is what actually flips
  // `waitlisted`.
  const trulyJoined = justJoined || (user ? Boolean(waitlisted) : false);

  // guestJoined is per-browser, not per-person — a shared device (library, family computer) can
  // carry a *previous* guest's "joined" flag for this program. Treat it as a suggestion, not a
  // fact: show it, but give whoever's looking at it now a way to prove it's not them by revealing
  // the form (showForm) instead of permanently blocking them from ever joining under their own
  // email on this device. Excludes justJoined so we don't second-guess what this visitor just did.
  const staleGuestJoined = !user && !justJoined && guestJoined;

  const handleJoin = (payload: { email?: string; full_name?: string }) => {
    joinWaitlist.mutate(
      { program: programId, ...payload },
      {
        onSuccess: () => {
          setJustJoined(true);
          if (!user) markJoined();
          setShowForm(false);
          toast.success("You're on the waitlist, we'll email and notify you when a new cohort opens.");
        },
        onError: (error) => {
          toast.error(error.message || "Couldn't join the waitlist. Please try again.");
        },
      },
    );
  };

  // showForm takes priority over trulyJoined/staleGuestJoined — it's the deliberate escape hatch
  // (either a guest who hasn't joined yet clicking the main button, or someone dismissing a stale
  // guestJoined flag via "Not you?" below) and must always win once set.
  if (!showForm) {
    if (trulyJoined) {
      return (
        <div className={`rounded-md border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-600 ${className ?? ""}`}>
          You&apos;re on the waitlist
        </div>
      );
    }

    if (staleGuestJoined) {
      return (
        <div className={`flex flex-col gap-1 rounded-md border border-gray-200 px-4 py-3 text-center ${className ?? ""}`}>
          <span className="text-sm font-medium text-gray-600">You&apos;re on the waitlist</span>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            Not you? Join with a different email
          </button>
        </div>
      );
    }

    if (user) {
      return (
        <button
          type="button"
          onClick={() => handleJoin({})}
          disabled={joinWaitlist.isPending}
          className={className ?? "w-full rounded-md bg-main px-4 py-3 text-center text-sm font-semibold text-white hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-60"}
        >
          {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className={className ?? "w-full rounded-md bg-main px-4 py-3 text-center text-sm font-semibold text-white hover:bg-deep-blue"}
      >
        Join Waitlist
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim()) {
          toast.error("Please enter your email.");
          return;
        }
        handleJoin({ email: email.trim(), full_name: fullName.trim() });
      }}
      className="flex flex-col gap-2 rounded-md border border-gray-200 p-3"
    >
      <input
        type="text"
        placeholder="Full name (optional)"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="rounded-md border border-gray-200 px-3 py-2 text-sm"
      />
      <input
        type="email"
        placeholder="Email address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-gray-200 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={joinWaitlist.isPending}
        className="w-full rounded-md bg-main px-4 py-2 text-center text-sm font-semibold text-white hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-60"
      >
        {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
      </button>
    </form>
  );
}
