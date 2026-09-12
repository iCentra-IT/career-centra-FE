"use client";

import { useEffect, useRef, useState } from "react";

// Drop-in replacement for useState that mirrors its value to localStorage under `key` — swap
// `useState` for this on any field that should survive a refresh (or the tab being closed and
// reopened). Same signature as useState, so adopting it in an existing form is a one-line change.
//
// SSR-safe: the server and the first client render both use `initialValue` (avoids a hydration
// mismatch), then a client-only effect rehydrates from storage a moment later. A second effect
// persists on every subsequent change; it deliberately skips its very first run so it doesn't
// clobber storage with `initialValue` before the rehydrate effect has had a chance to read it.
export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const isFirstPersist = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // Syncing in a browser-only value (localStorage isn't available during SSR/first paint) is
      // exactly what this effect is for — the alternative, reading it in the useState initializer,
      // would return different markup on the server vs. the client and cause a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      // Corrupt or unavailable storage (private mode, quota, etc.) — keep the initial value.
    }
    // Only re-run if the key itself changes (e.g. switching from a "create" to an "edit" draft).
  }, [key]);

  useEffect(() => {
    if (isFirstPersist.current) {
      isFirstPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full/unavailable — persistence is a nicety, not a hard requirement.
    }
  }, [key, state]);

  return [state, setState];
}

// Clears one persisted key — call on a successful submit so a stale draft doesn't linger and
// reappear the next time the form is opened.
export function clearPersistedState(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Clears every persisted key under a prefix — for a form that persists several fields under
// `${persistKey}:fieldName` keys, call this once with `persistKey` instead of clearing each field.
export function clearPersistedStateByPrefix(prefix: string) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// True only for an actual browser refresh (F5 / reload button) of the current page — false for a
// fresh visit (first load, a link click, typing the URL), including a client-side SPA navigation
// to this route, since that doesn't create a new Navigation Timing entry at all and so falls back
// to whatever the tab's original hard-load type was.
function isPageReload(): boolean {
  if (typeof window === "undefined" || typeof performance === "undefined") return false;
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type === "reload";
}

// A form's draft should resume itself after a refresh, but NOT after the admin abandons it and
// later revisits the same "create X" / "edit X" page fresh — otherwise stale, possibly-incomplete
// field values from an old attempt silently resurface and get resubmitted, which reads as data
// randomly "going missing" (whatever the old draft didn't have gets sent instead of the real
// current values). Call this once, before any usePersistedState field under `prefix` is read —
// e.g. at the top of the page component, guarded by a ref so it only runs on that first render.
export function discardStaleDraft(prefix: string) {
  if (!isPageReload()) clearPersistedStateByPrefix(prefix);
}
