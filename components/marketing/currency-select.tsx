"use client";

import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useStudentProfile } from "@/hooks/queries/students";
import { useSetCurrencyPreference } from "@/hooks/mutations/students";
import type { CurrencyPreference } from "@/types/student";

const CURRENCY_OPTIONS: CurrencyPreference[] = ["NGN", "USD", 
  // "EUR", "GBP", "GHS", "KES"
];

// Only students have a stored currency preference (POST /api/students/currency-preference/ lives
// under /students/), so this renders only for a logged-in student — not guests, facilitators, or
// admins. Defaults to whatever the backend already resolved onto the student's profile (the
// endpoint always returns a real currency, seemingly set from the student's registered
// country/region at signup), rather than a client-side guess.
export function CurrencySelect({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useStudentProfile();
  const setCurrencyPreference = useSetCurrencyPreference();

  if (user?.role !== "student" || !profile) return null;

  return (
    <select
      value={profile.currency_preference}
      onChange={(e) =>
        setCurrencyPreference.mutate(
          { currency_preference: e.target.value as CurrencyPreference },
          { onError: (err) => toast.error(err.message) },
        )
      }
      disabled={setCurrencyPreference.isPending}
      aria-label="Currency"
      className={`rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:opacity-60 ${className ?? ""}`}
    >
      {CURRENCY_OPTIONS.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  );
}
