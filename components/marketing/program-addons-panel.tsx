"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useCohortAddons } from "@/hooks/queries/addons";
import { useAddStandaloneCartAddon } from "@/hooks/mutations/cart";
import { applyAddonSelection, cohortAddonLabel } from "@/lib/addons";
import { Button } from "@/components/ui/button";
import type { ProgramAddonSummary } from "@/types/addon";

// Compact, collapsed-by-default add-on chooser for the program page. Ticking an add-on in a
// selection group unticks its siblings. Buying on its own needs no cohort; enrolling uses the same
// selection, so one choice serves both buttons.
export function ProgramAddonsPanel({
  addons,
  cohortId,
  selectedIds,
  onChange,
}: {
  addons: ProgramAddonSummary[];
  cohortId?: number;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();
  // Per-cohort availability and prices only exist for signed-in accounts.
  const { data: cohortAddons = [] } = useCohortAddons(user ? cohortId : undefined);
  const addToCart = useAddStandaloneCartAddon();

  const offered = addons.filter((a) => a.is_active).sort((a, b) => a.sort_order - b.sort_order);
  if (offered.length === 0) return null;

  const cohortById = new Map(cohortAddons.map((c) => [c.id, c]));
  const isUnavailable = (id: number) => !!cohortById.size && cohortById.get(id)?.is_available === false;
  const selectedCount = selectedIds.length;

  // Added with no cohort, same as the cart's own standalone-addon lines — they then check out
  // together with whatever else is in the cart, rather than as a separate instant purchase.
  const addSelectedToCart = async () => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await addToCart.mutateAsync(id);
      }
      toast.success(`Added ${selectedCount} add-on${selectedCount === 1 ? "" : "s"} to your cart.`, {
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
      onChange([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add that add-on to your cart.");
    }
  };

  return (
    <details className="group mt-5 rounded-xl border border-gray-200">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-gray-900">
          Add-ons
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{offered.length}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-500">
          {selectedCount > 0 ? `${selectedCount} selected` : "Optional"}
          <svg width="12" height="12" viewBox="0 0 12 12" className="transition group-open:rotate-180" aria-hidden="true">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </summary>

      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
        <ul className="flex flex-col gap-1">
          {offered.map((a) => {
            const checked = selectedIds.includes(a.id);
            const unavailable = isUnavailable(a.id);
            const cohortPrice = cohortById.get(a.id);
            return (
              <li key={a.id}>
                <label
                  className={`flex items-start gap-3 rounded-lg px-2 py-2 text-sm ${
                    unavailable ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={unavailable}
                    onChange={() => onChange(applyAddonSelection(offered, selectedIds, a.id))}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">{a.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-gray-900">
                        {unavailable
                          ? "Not for this cohort"
                          : cohortPrice
                            ? `+${cohortAddonLabel(cohortPrice)}`
                            : `$${a.price_usd}${a.pricing_mode !== "usd_only" ? ` · ₦${a.price_ngn}` : ""}`}
                      </span>
                    </span>
                    {a.description && <span className="block text-xs text-gray-500">{a.description}</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-gray-100 pt-3">
          {user ? (
            <div className="flex flex-col gap-2">
              <Button type="button" onClick={addSelectedToCart} disabled={selectedCount === 0} loading={addToCart.isPending}>
                Add to cart
              </Button>
              <p className="text-center text-xs text-gray-400">No cohort needed — check out together with anything else in your cart.</p>
            </div>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="block rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log in to add add-ons to your cart
            </Link>
          )}
        </div>
      </div>
    </details>
  );
}
