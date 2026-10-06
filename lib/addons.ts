import type { ProgramAddon } from "@/types/addon";
import { formatMoney } from "@/lib/format";

// Price of one add-on in the given display currency. usd_only add-ons only have a USD price.
export function addonPriceFor(addon: ProgramAddon, currency: string): { amount: string; currency: string } {
  if (currency === "NGN" && addon.pricing_mode !== "usd_only" && parseFloat(addon.price_ngn) > 0) {
    return { amount: addon.price_ngn, currency: "NGN" };
  }
  return { amount: addon.price_usd, currency: "USD" };
}

export function addonPriceLabel(addon: ProgramAddon, currency: string): string {
  const p = addonPriceFor(addon, currency);
  return formatMoney(p.amount, p.currency);
}

// Given the add-on the learner just ticked, which others must be dropped? Add-ons sharing a
// non-empty selection_group are mutually exclusive — e.g. only one coaching variant at a time.
export function applyAddonSelection(
  addons: ProgramAddon[],
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
