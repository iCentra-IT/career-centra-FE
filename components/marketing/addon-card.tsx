"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useCart } from "@/hooks/queries/cart";
import { useAddStandaloneCartAddon } from "@/hooks/mutations/cart";
import { displayTitle } from "@/lib/format";
import { Modal } from "@/components/ui/modal";
import type { PublicProgramListing } from "@/types/programs";
import type { ProgramAddonSummary } from "@/types/addon";

function addonTypeLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Sits in the same grid as ProgramCard, directly after the program it belongs to — so an add-on
// shows up right beside its program instead of in a separate "Add-ons" section elsewhere on the
// page (or behind a now-removed Programs/Add-ons tab) that someone would have had to know to go
// looking for. Deliberately a lighter card than ProgramCard (bordered white, not the dark
// gradient hero) so the two read as "the program" vs. "an extra for it" at a glance, even sitting
// right next to each other.
//
// Clicking the card opens a modal scoped to just this add-on (name, description, price, Add to
// cart) rather than sending the visitor to the full program detail page — that page is built
// around the cohort/enrol flow (dates, seats, "Enrol Now"), none of which applies to buying a
// standalone add-on, so landing there to take an add-on-only action was a detour through the
// wrong page's worth of content just to find the one thing (Add to cart) already sitting right
// here on the card.
export function AddonCard({
  program,
  addon,
}: {
  program: PublicProgramListing;
  addon: ProgramAddonSummary;
}) {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const guestStandaloneAddons = useCartStore((s) => s.standaloneAddons);
  const addGuestAddon = useCartStore((s) => s.addStandaloneAddon);
  const { data: cart } = useCart();
  const addToCart = useAddStandaloneCartAddon();

  const inCart = user
    ? !!cart?.standalone_addons.some((line) => line.addon_id === addon.id)
    : guestStandaloneAddons.some((line) => line.addonId === addon.id);

  const priceText =
    addon.pricing_mode === "usd_only" ? `$${addon.price_usd}` : `$${addon.price_usd} · ₦${addon.price_ngn}`;

  const handleAdd = () => {
    if (inCart) return;

    if (!user) {
      addGuestAddon({
        addonId: addon.id,
        programSlug: program.slug,
        programTitle: program.title,
        name: addon.name,
        priceAmount: addon.price_usd,
        priceCurrency: "USD",
      });
      toast.success("Added to cart.");
      return;
    }

    addToCart.mutate(addon.id, {
      onSuccess: () => toast.success("Added to cart."),
      onError: (error) => toast.error(error.message),
    });
  };

  const addToCartButton = (
    <button
      type="button"
      onClick={handleAdd}
      disabled={inCart || addToCart.isPending}
      className="flex w-full items-center justify-center gap-1 rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {inCart ? "Added to cart" : addToCart.isPending ? "Adding…" : "Add to cart"}
    </button>
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        className="flex cursor-pointer flex-col justify-between rounded-2xl border border-dashed border-secondary/30 bg-secondary/5 p-5 transition hover:border-secondary/50"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
              Add-on
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500">
              {addonTypeLabel(addon.addon_type)}
            </span>
          </div>
          <p className="mt-4 truncate text-xs font-medium text-gray-400">For {displayTitle(program.title)}</p>
          <h3 className="mt-1 text-base font-semibold text-gray-900">{addon.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-gray-600">
            {addon.description || "Standalone add-on available for this program."}
          </p>
        </div>
        <div className="mt-6 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-400">Add-on price</p>
          <span className="text-sm font-semibold text-gray-900">{priceText}</span>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1 rounded-full border border-secondary/30 py-2 text-xs font-medium text-secondary">
          View & add to cart →
        </p>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <span className="inline-flex items-center rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
          Add-on
        </span>
        <p className="mt-3 text-xs font-medium text-gray-400">For {displayTitle(program.title)}</p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">{addon.name}</h2>
        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
          {addonTypeLabel(addon.addon_type)}
        </span>
        <p className="mt-3 text-sm text-gray-600">
          {addon.description || "Standalone add-on available for this program."}
        </p>
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">Add-on price</p>
          <span className="text-sm font-semibold text-gray-900">{priceText}</span>
        </div>
        <div className="mt-3">{addToCartButton}</div>
        <Link
          href={`/programms/${program.slug}`}
          className="mt-3 block text-center text-xs font-medium text-secondary hover:underline"
        >
          View full program page
        </Link>
      </Modal>
    </>
  );
}
