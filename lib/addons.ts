import { formatMoney } from "@/lib/format";
import type { CohortAddon } from "@/types/addon";

export function cohortAddonLabel(addon: CohortAddon): string {
  return formatMoney(addon.amount, addon.currency);
}

// Given the add-on the learner just ticked, which others must be dropped? Add-ons sharing a
// non-empty selection_group are mutually exclusive — e.g. only one coaching variant at a time.
export function applyAddonSelection<T extends { id: number; selection_group: string }>(
  addons: T[],
  selectedIds: number[],
  toggledId: number,
): number[] {
  const toggled = addons.find((a) => a.id === toggledId);
  if (!toggled) return selectedIds;
  if (selectedIds.includes(toggledId)) return selectedIds.filter((id) => id !== toggledId);
  const group = toggled.selection_group;
  const withoutGroup = group
    ? selectedIds.filter((id) => addons.find((a) => a.id === id)?.selection_group !== group)
    : selectedIds;
  return [...withoutGroup, toggledId];
}
