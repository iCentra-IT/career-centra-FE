import { formatMoney } from "@/lib/format";
import type { CohortAddon } from "@/types/addon";

export function cohortAddonLabel(addon: CohortAddon): string {
  return formatMoney(addon.amount, addon.currency);
}

// Customer-facing heading for a group of mutually-exclusive add-ons, keyed by the broad
// `addon_type` category they share (see apps.programs.enums.AddonType on the backend).
export const ADDON_GROUP_LABELS: Record<string, string> = {
  support: "Support",
  coaching: "Coaching",
  exam: "Exam",
  question_bank: "Question Bank",
};

export interface AddonGroup<T> {
  key: string; // the shared selection_group value
  label: string;
  items: T[];
}

// Add-ons sharing a non-empty selection_group are mutually exclusive (see applyAddonSelection
// below) and should be presented together under one "choose one" heading so that exclusivity is
// visible before a pick unticks a sibling, not discovered by surprise afterwards. Add-ons with no
// selection_group are independent and rendered on their own.
export function groupAddonsBySelection<
  T extends { id: number; selection_group: string; addon_type: string },
>(addons: T[]): { groups: AddonGroup<T>[]; singles: T[] } {
  const order: string[] = [];
  const buckets = new Map<string, T[]>();
  const singles: T[] = [];

  for (const addon of addons) {
    if (!addon.selection_group) {
      singles.push(addon);
      continue;
    }
    if (!buckets.has(addon.selection_group)) order.push(addon.selection_group);
    const bucket = buckets.get(addon.selection_group) ?? [];
    bucket.push(addon);
    buckets.set(addon.selection_group, bucket);
  }

  const groups = order.map((key) => {
    const items = buckets.get(key) as T[];
    return { key, label: ADDON_GROUP_LABELS[items[0].addon_type] ?? items[0].addon_type, items };
  });

  return { groups, singles };
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
