"use client";

import { applyAddonSelection, cohortAddonLabel } from "@/lib/addons";
import type { CohortAddon } from "@/types/addon";

// Learner-facing add-on chooser for one cohort, shared by the cart and the program page. Add-ons in
// the same selection group behave like radio buttons; the rest are independent checkboxes. Add-ons
// the cohort doesn't offer are shown greyed out, not hidden, so the learner knows they exist.
export function AddonPicker({
  addons,
  selectedIds,
  onChange,
  disabled = false,
}: {
  addons: CohortAddon[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}) {
  const offered = addons.filter((a) => a.is_available || selectedIds.includes(a.id));
  if (offered.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Add-ons</p>
      <ul className="flex flex-col gap-2">
        {offered.map((addon) => {
          const checked = selectedIds.includes(addon.id);
          const exclusive = !!addon.selection_group;
          const unavailable = !addon.is_available;
          return (
            <li key={addon.id}>
              <label
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition ${
                  unavailable
                    ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                    : checked
                      ? "cursor-pointer border-secondary bg-secondary/5"
                      : "cursor-pointer border-gray-200 bg-white hover:border-gray-300"
                } ${disabled ? "cursor-wait" : ""}`}
              >
                <input
                  type={exclusive ? "radio" : "checkbox"}
                  name={exclusive ? `addon-group-${addon.selection_group}` : undefined}
                  checked={checked}
                  disabled={disabled || unavailable}
                  onChange={() => onChange(applyAddonSelection(addons, selectedIds, addon.id))}
                  className="mt-1 h-4 w-4 text-secondary focus:ring-secondary"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-gray-900">{addon.name}</span>
                    <span className="shrink-0 font-semibold text-gray-900">
                      {unavailable ? "Unavailable" : `+${cohortAddonLabel(addon)}`}
                    </span>
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
