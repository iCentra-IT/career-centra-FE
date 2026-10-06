"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useProgramAddons } from "@/hooks/queries/addons";
import { useInitiateStandaloneAddons } from "@/hooks/mutations/enrollment";
import { applyAddonSelection } from "@/lib/addons";
import { Button } from "@/components/ui/button";
import type { ProgramAddon } from "@/types/addon";

// For learners who want an add-on without enrolling in a cohort (coaching, an exam fee, a question
// bank). Only shows when the add-on list is readable for this account; otherwise it stays hidden.
export function AddonsOnlyCheckout({ programSlug }: { programSlug: string }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const { data, isError } = useProgramAddons(programSlug);
  const checkout = useInitiateStandaloneAddons();
  const [selected, setSelected] = useState<number[]>([]);

  // The add-on list is only served to signed-in accounts, so visitors get a sign-in prompt instead.
  if (!user) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Add-ons for this program</p>
        <p className="mt-1 text-xs text-gray-500">
          Coaching, exam fees and question banks can be bought on their own. Log in to see what&apos;s available.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="mt-3 inline-flex rounded-full bg-main px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Log in to view add-ons
        </Link>
      </div>
    );
  }
  if (isError || !data) return null;

  const offered: ProgramAddon[] = data.filter((a) => a.is_active);
  if (offered.length === 0) return null;

  const buy = () => {
    if (selected.length === 0) return;
    checkout.mutate(selected, {
      onSuccess: (res) => {
        if (res.order_id != null) {
          try {
            sessionStorage.setItem("checkout_order_id", String(res.order_id));
          } catch {
            /* sessionStorage may be unavailable */
          }
        }
        window.location.href = res.gateway_url;
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <p className="text-sm font-semibold text-gray-900">Add-ons only</p>
      <p className="mt-1 text-xs text-gray-500">Buy extras on their own — no cohort needed.</p>
      <ul className="mt-3 flex flex-col gap-2">
        {offered.map((a) => {
          const checked = selected.includes(a.id);
          const exclusive = !!a.selection_group;
          return (
            <li key={a.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 text-sm hover:border-gray-300">
                <input
                  type={exclusive ? "radio" : "checkbox"}
                  name={exclusive ? `standalone-group-${a.selection_group}` : undefined}
                  checked={checked}
                  onChange={() => setSelected(applyAddonSelection(offered, selected, a.id))}
                  className="mt-1 h-4 w-4 text-secondary focus:ring-secondary"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-gray-900">{a.name}</span>
                    <span className="shrink-0 text-right text-xs text-gray-900">
                      ${a.price_usd}
                      {a.pricing_mode !== "usd_only" && ` · ₦${a.price_ngn}`}
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">Final price is confirmed at checkout.</span>
        <Button type="button" onClick={buy} disabled={selected.length === 0} loading={checkout.isPending} className="w-auto px-4">
          Buy add-ons
        </Button>
      </div>
    </div>
  );
}
