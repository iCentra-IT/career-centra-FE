"use client";

import { applyAddonSelection, cohortAddonLabel, groupAddonsBySelection } from "@/lib/addons";
import type { CohortAddon } from "@/types/addon";

function AddonRow({
  addon,
  checked,
  disabled,
  inCart,
  onToggle,
}: {
  addon: CohortAddon;
  checked: boolean;
  disabled?: boolean;
  inCart?: boolean;
  onToggle: () => void;
}) {
  const unavailable = !addon.is_available;
  return (
    <li>
      <label
        className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition ${
          unavailable || inCart
            ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
            : checked
              ? "cursor-pointer border-secondary bg-secondary/5"
              : "cursor-pointer border-gray-200 bg-white hover:border-gray-300"
        } ${disabled ? "cursor-wait" : ""}`}
      >
        <input
          type="checkbox"
          checked={checked && !inCart}
          disabled={disabled || unavailable || inCart}
          onChange={onToggle}
          className="mt-1 h-4 w-4 text-secondary focus:ring-secondary"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="min-w-0 truncate font-medium text-gray-900">{addon.name}</span>
            <span className="shrink-0 font-semibold text-gray-900">
              {inCart ? "Already in cart" : unavailable ? "Unavailable" : `+${cohortAddonLabel(addon)}`}
            </span>
          </span>
          {addon.description && <span className="mt-0.5 block text-xs text-gray-500">{addon.description}</span>}
        </span>
      </label>
    </li>
  );
}

// Learner-facing add-on chooser for one cohort, shared by the cart and the program page. Add-ons
// sharing a selection_group are mutually exclusive — grouped together under a "choose one" heading
// so that's visible up front, instead of being discovered by surprise when picking one unticks a
// sibling. Add-ons the cohort doesn't offer are shown greyed out, not hidden, so the learner knows
// they exist.
export function AddonPicker({
  addons,
  selectedIds,
  onChange,
  disabled = false,
  inCartIds = [],
}: {
  addons: CohortAddon[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  // Add-on ids already sitting in the cart as a standalone (no-cohort) line for this same
  // program — greyed out here so there's no way to pick the same add-on twice (once standalone,
  // once attached to this cohort), which would otherwise bill it twice. Mirrors the same guard on
  // ProgramAddonsPanel's picker.
  inCartIds?: number[];
}) {
  const offered = addons.filter((a) => a.is_available || selectedIds.includes(a.id));
  if (offered.length === 0) return null;

  const inCartIdSet = new Set(inCartIds);
  const { groups, singles } = groupAddonsBySelection(offered);
  const toggle = (id: number) => onChange(applyAddonSelection(addons, selectedIds, id));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Add-ons</p>
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500">{group.label} — choose one</p>
          <ul className="flex flex-col gap-2">
            {group.items.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                checked={selectedIds.includes(addon.id)}
                disabled={disabled}
                inCart={inCartIdSet.has(addon.id)}
                onToggle={() => toggle(addon.id)}
              />
            ))}
          </ul>
        </div>
      ))}
      {singles.length > 0 && (
        <ul className="flex flex-col gap-2">
          {singles.map((addon) => (
            <AddonRow
              key={addon.id}
              addon={addon}
              checked={selectedIds.includes(addon.id)}
              disabled={disabled}
              inCart={inCartIdSet.has(addon.id)}
              onToggle={() => toggle(addon.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
