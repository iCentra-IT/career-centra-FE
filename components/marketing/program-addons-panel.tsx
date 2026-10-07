"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useCart } from "@/hooks/queries/cart";
import { useCohortAddons } from "@/hooks/queries/addons";
import { useAddStandaloneCartAddon } from "@/hooks/mutations/cart";
import { applyAddonSelection, cohortAddonLabel, groupAddonsBySelection } from "@/lib/addons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ProgramAddonSummary } from "@/types/addon";

function AddonRow({
  addon,
  checked,
  unavailable,
  inCart,
  priceLabel,
  onToggle,
}: {
  addon: ProgramAddonSummary;
  checked: boolean;
  unavailable: boolean;
  inCart: boolean;
  priceLabel: string;
  onToggle: () => void;
}) {
  const disabled = unavailable || inCart;
  return (
    <li>
      <label
        className={`flex items-start gap-3 rounded-lg px-2 py-2 text-sm ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
        }`}
      >
        <input
          type="checkbox"
          checked={checked && !inCart}
          disabled={disabled}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="font-medium text-gray-900">{addon.name}</span>
            <span className="shrink-0 text-xs font-semibold text-gray-900">
              {inCart ? "Already in cart" : priceLabel}
            </span>
          </span>
          {addon.description && <span className="block text-xs text-gray-500">{addon.description}</span>}
        </span>
      </label>
    </li>
  );
}

// Compact add-on chooser for the program page's sticky price card. The full picker opens in a
// modal rather than expanding inline — an inline <details> here grows with however many add-ons
// the program has and drags the sticky card (and the page below it) down with it; a modal keeps
// the card's height constant no matter the catalog size. Add-ons sharing a selection_group are
// grouped under a "choose one" heading inside it — ticking one in a group unticks its siblings,
// same as the cart's AddonPicker, so exclusivity reads the same everywhere. Buying on its own needs
// no cohort; enrolling uses the same selection, so one choice serves both buttons — the helper text
// under them exists specifically to say which button does which with that shared selection.
export function ProgramAddonsPanel({
  addons,
  cohortId,
  programSlug,
  programTitle,
  selectedIds,
  onChange,
}: {
  addons: ProgramAddonSummary[];
  cohortId?: number;
  // Needed only to snapshot a guest's pick locally (see addSelectedToCart) — not used once signed in.
  programSlug: string;
  programTitle: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Per-cohort availability and prices only exist for signed-in accounts.
  const { data: cohortAddons = [] } = useCohortAddons(user ? cohortId : undefined);
  const { data: cart } = useCart();
  const guestStandaloneAddons = useCartStore((s) => s.standaloneAddons);
  const addToCart = useAddStandaloneCartAddon();

  const offered = addons.filter((a) => a.is_active).sort((a, b) => a.sort_order - b.sort_order);
  if (offered.length === 0) return null;

  // Add-ons already sitting in the cart as a standalone line — greyed out and unselectable below
  // so there's no way to try adding the same add-on twice (the backend would just 400 on the
  // duplicate anyway, since CartStandaloneAddon is unique per cart+addon).
  const inCartIds = new Set(
    user
      ? (cart?.standalone_addons ?? []).map((a) => a.addon_id)
      : guestStandaloneAddons.map((a) => a.addonId),
  );

  const cohortById = new Map(cohortAddons.map((c) => [c.id, c]));
  const isUnavailable = (id: number) => !!cohortById.size && cohortById.get(id)?.is_available === false;
  const priceLabel = (a: ProgramAddonSummary) => {
    if (isUnavailable(a.id)) return "Not for this cohort";
    const cohortPrice = cohortById.get(a.id);
    if (cohortPrice) return `+${cohortAddonLabel(cohortPrice)}`;
    return `$${a.price_usd}${a.pricing_mode !== "usd_only" ? ` · ₦${a.price_ngn}` : ""}`;
  };
  const selectedCount = selectedIds.length;
  // selectedIds is local, unselected-on-reload UI state — it has no memory of add-ons already
  // bought on a previous visit. Falls back to this so the trigger doesn't claim "Add add-ons" when
  // some are already sitting in the cart.
  const inCartCount = offered.filter((a) => inCartIds.has(a.id)).length;
  const { groups, singles } = groupAddonsBySelection(offered);
  const toggle = (id: number) => onChange(applyAddonSelection(offered, selectedIds, id));

  // Added with no cohort, same as the cart's own standalone-addon lines — they then check out
  // together with whatever else is in the cart, rather than as a separate instant purchase.
  // The backend's cart (and its /api/cart/merge/ endpoint) only exists for signed-in students, but
  // a guest can still pick add-ons now and have them folded in automatically on login — same
  // pattern cohorts already use via useCartStore — so there's no reason to wall this behind login.
  const addSelectedToCart = async () => {
    if (selectedIds.length === 0) return;

    if (!user) {
      for (const id of selectedIds) {
        const addon = offered.find((a) => a.id === id);
        if (!addon) continue;
        const cohortPrice = cohortById.get(id);
        useCartStore.getState().addStandaloneAddon({
          addonId: id,
          programSlug,
          programTitle,
          name: addon.name,
          priceAmount: cohortPrice ? String(cohortPrice.amount) : addon.price_usd,
          priceCurrency: cohortPrice?.currency ?? "USD",
        });
      }
      toast.success(`Added ${selectedCount} add-on${selectedCount === 1 ? "" : "s"} to your cart.`, {
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
      onChange([]);
      return;
    }

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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm hover:border-gray-300"
      >
        <span className="flex items-center gap-2 font-medium text-gray-900">
          Add-ons
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{offered.length}</span>
        </span>
        <span className="text-xs font-medium text-secondary">
          {selectedCount > 0
            ? `${selectedCount} selected · Edit`
            : inCartCount > 0
              ? `${inCartCount} in cart · Edit`
              : "Add add-ons"}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} size="lg">
        <h3 className="text-lg font-semibold text-gray-900">Add-ons</h3>
        <p className="mt-1 text-sm text-gray-500">Optional extras for this program.</p>

        <div className="mt-5 flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-500">{group.label} — choose one</p>
              <ul className="flex flex-col gap-1">
                {group.items.map((a) => (
                  <AddonRow
                    key={a.id}
                    addon={a}
                    checked={selectedIds.includes(a.id)}
                    unavailable={isUnavailable(a.id)}
                    inCart={inCartIds.has(a.id)}
                    priceLabel={priceLabel(a)}
                    onToggle={() => toggle(a.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
          {singles.length > 0 && (
            <ul className="flex flex-col gap-1">
              {singles.map((a) => (
                <AddonRow
                  key={a.id}
                  addon={a}
                  checked={selectedIds.includes(a.id)}
                  unavailable={isUnavailable(a.id)}
                  inCart={inCartIds.has(a.id)}
                  priceLabel={priceLabel(a)}
                  onToggle={() => toggle(a.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
          {selectedCount > 0 && cohortId && (
            <p className="rounded-md bg-secondary/5 px-3 py-2 text-xs text-gray-600">
              Clicking <span className="font-medium text-gray-900">Enrol Now</span> includes these
              add-ons with the cohort. Use <span className="font-medium text-gray-900">Add to cart</span>{" "}
              below only if you want to buy them on their own, with no cohort.
            </p>
          )}
          <Button type="button" onClick={addSelectedToCart} disabled={selectedCount === 0} loading={addToCart.isPending}>
            Add to cart (no cohort)
          </Button>
          <p className="text-center text-xs text-gray-400">
            {user
              ? "No cohort needed — check out together with anything else in your cart."
              : "No account needed yet — this is saved to your cart until you check out."}
          </p>
        </div>
      </Modal>
    </>
  );
}
