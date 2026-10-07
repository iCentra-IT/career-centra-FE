"use client";

import { toast } from "sonner";
import { useProgramAddons } from "@/hooks/queries/addons";
import { useAddStandaloneCartAddon } from "@/hooks/mutations/cart";
import { groupAddonsBySelection } from "@/lib/addons";
import { displayTitle } from "@/lib/format";
import type { ProgramAddon } from "@/types/addon";

// Lets a buyer add another cohort-less add-on for a program already in their cart, without leaving
// the cart page — previously the only way to do this was back on the program's own page. One of
// these renders per distinct program in the cart (see ServerCart), so a multi-program cart gets one
// picker per program rather than one giant mixed catalog.
export function StandaloneAddonPicker({
  programSlug,
  programTitle,
  excludeAddonIds,
}: {
  programSlug: string;
  programTitle: string;
  excludeAddonIds: number[];
}) {
  const { data: addons = [] } = useProgramAddons(programSlug);
  const addToCart = useAddStandaloneCartAddon();

  const available = addons.filter((a) => a.is_active && !excludeAddonIds.includes(a.id));
  if (available.length === 0) return null;

  const { groups, singles } = groupAddonsBySelection(available);

  const add = (addon: ProgramAddon) =>
    addToCart.mutate(addon.id, {
      onSuccess: () => toast.success(`Added ${addon.name} to your cart.`),
      onError: (err) => toast.error(err.message),
    });

  const row = (addon: ProgramAddon) => (
    <li key={addon.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">{addon.name}</p>
        <p className="text-xs text-gray-400">
          ${addon.price_usd}
          {addon.pricing_mode !== "usd_only" ? ` · ₦${addon.price_ngn}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={() => add(addon)}
        disabled={addToCart.isPending}
        className="shrink-0 rounded-md bg-main px-3 py-1.5 text-xs font-medium text-white hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Add
      </button>
    </li>
  );

  return (
    <div className="mt-3 border-t border-gray-50 pt-3 first:mt-0 first:border-t-0 first:pt-0">
      <p className="px-2 text-xs font-medium text-gray-500">More add-ons for {displayTitle(programTitle)}</p>
      <div className="mt-1 flex flex-col gap-2">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="px-2 text-xs text-gray-400">{group.label} — choose one</p>
            <ul className="flex flex-col">{group.items.map(row)}</ul>
          </div>
        ))}
        {singles.length > 0 && <ul className="flex flex-col">{singles.map(row)}</ul>}
      </div>
    </div>
  );
}
