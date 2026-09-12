"use client";

import { useEffect, useRef } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

// The react-hook-form counterpart to usePersistedState: mirrors a form's values to localStorage
// under `key` and restores them on mount, so a refresh (or closing the tab) doesn't lose what was
// typed. Pass `exclude` for fields that should never touch storage — always exclude passwords and
// anything else sensitive.
export function usePersistedFormDraft<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  options?: { exclude?: Path<T>[] },
) {
  const hydrated = useRef(false);
  const exclude = options?.exclude ?? [];

  // Rehydrate once on mount. A plain object assign (not form.reset, which the watch subscription
  // below hasn't attached to yet at this point) — see the persist effect for why that ordering matters.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        form.reset(JSON.parse(raw), { keepDefaultValues: true });
      }
    } catch {
      // Corrupt/unavailable storage (private mode, quota, etc.) — keep whatever defaultValues gave us.
    } finally {
      hydrated.current = true;
    }
    // Only re-run if the key itself changes (e.g. a different draft entirely).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on every change. form.watch's callback only fires for changes from here on — it was
  // never subscribed during the rehydrate effect above, so it can't clobber the value that effect
  // just restored.
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!hydrated.current) return;
      const toStore = { ...values } as Record<string, unknown>;
      for (const field of exclude) delete toStore[field as string];
      try {
        window.localStorage.setItem(key, JSON.stringify(toStore));
      } catch {
        // Storage full/unavailable — persistence is a nicety, not a hard requirement.
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
