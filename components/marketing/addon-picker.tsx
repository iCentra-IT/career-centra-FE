"use client";

import { addonPriceLabel, applyAddonSelection } from "@/lib/addons";
import type { ProgramAddon } from "@/types/addon";

// Learner-facing add-on chooser, shared by the cart and the program page. Add-ons in the same
// selection group behave like radio buttons; the rest are independent checkboxes.
export function AddonPicker({
  addons,
  currency,
  selectedIds,
  onChange,
  disabled = false,
}: {
  addons: ProgramAddon[];
  currency: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}) {
  const offered = addons.filter((a) => a.is_active);
  if (offered.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Add-ons</p>
      <ul className="flex flex-col gap-2">
        {offered.map((addon) => {
          const checked = selectedIds.includes(addon.id);
          const exclusive = !!addon.selection_group;
          return (
            <li key={addon.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                  checked ? "border-secondary bg-secondary/5" : "border-gray-200 bg-white hover:border-gray-300"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type={exclusive ? "radio" : "checkbox"}
                  name={exclusive ? `addon-group-${addon.selection_group}` : undefined}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(applyAddonSelection(offered, selectedIds, addon.id))}
                  className="mt-1 h-4 w-4 text-secondary focus:ring-secondary"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-gray-900">{addon.name}</span>
                    <span className="shrink-0 font-semibold text-gray-900">+{addonPriceLabel(addon, currency)}</span>
                  </span>
                  {addon.description && <span className="mt-0.5 block text-xs text-gray-500">{addon.description}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
