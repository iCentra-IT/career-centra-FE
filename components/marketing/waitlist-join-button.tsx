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
  // request); guests fall back to their browser-local flag. justJoined bridges the gap between a
  // successful POST and the next program refetch, which is what actually flips `waitlisted`.
  const joined = justJoined || (user ? Boolean(waitlisted) : guestJoined);

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

  if (joined) {
    return (
      <div className={`rounded-md border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-600 ${className ?? ""}`}>
        You&apos;re on the waitlist
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

  if (!showForm) {
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
