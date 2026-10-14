"use client";

import { usePersistedState } from "@/hooks/use-persisted-state";

// Guest-only "already joined the waitlist" memory. Authenticated users read their membership
// straight off the program detail payload (Program.waitlist_joined, server truth per request), so
// this store exists purely for anonymous visitors — who have no server-side identity to look up
// and whose only durable marker is the browser they joined from.
//
// No GET exists to read waitlist membership, so we remember it locally rather than re-POSTing just
// to discover the guest is already on the list. Scope is per-browser: once they register, the
// server backfills the guest entry onto the new account (backfill_waitlist_user), and from then on
// the authenticated path takes over. Even if the marker is ever stale, POST
// /api/cohorts/waitlist/ is idempotent, so a click returns the existing entry instead of
// duplicating it.
const KEY = "waitlist-joined-program-ids";

export function useWaitlistMembership(programId: number) {
  const [programIds, setProgramIds] = usePersistedState<number[]>(KEY, []);
  const joined = programIds.includes(programId);

  const markJoined = () => {
    setProgramIds((prev) => (prev.includes(programId) ? prev : [...prev, programId]));
  };

  return { joined, markJoined };
}
