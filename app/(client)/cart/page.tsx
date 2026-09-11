"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore, type CartItem } from "@/lib/store/cartStore";
import { useCart } from "@/hooks/queries/cart";
import { useEmptyCart, useRemoveCartItem, useCheckoutCart } from "@/hooks/mutations/cart";
import { queryKeys } from "@/lib/api/query-keys";
import { displayTitle, formatShortDate, formatCurrency, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CartItemLine } from "@/types/cart";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M6 7.5v4M10 7.5v4M4 4.5l.6 8a1 1 0 001 .9h4.8a1 1 0 001-.9l.6-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M10 22h30l6 6h8a2 2 0 012 2v20a4 4 0 01-4 4H14a4 4 0 01-4-4V22z" fill="#00AFEB" />
      <path d="M10 22a4 4 0 014-4h10l4 5" fill="#00AFEB" />
      <circle cx="42" cy="42" r="9" fill="white" />
      <circle cx="42" cy="42" r="6" stroke="#0c236c" strokeWidth="2" />
      <path d="M46.5 46.5L51 51" stroke="#0c236c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <EmptyCartIcon />
      <p className="max-w-xs text-sm text-gray-500">
        Your cart is empty. Please add a course to your cart to place an order.
      </p>
      <Link
        href="/programms"
        className="rounded-md bg-main px-8 py-3 text-sm font-medium text-white hover:bg-deep-blue"
      >
        Start shopping
      </Link>
    </div>
  );
}

function certificateProviderLabel(provider: string): string | null {
  if (provider === "pmi") return "PMI Authorized";
  if (provider === "icentra") return "iCentra Certificate";
  return null;
}

/* ------------------------------------------------------------------ guest cart */

function GuestItemCard({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-linear-to-br from-main to-deep-blue p-5 text-white">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from cart"
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
      >
        <TrashIcon />
      </button>
      <div>
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          {item.badge}
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-glass">
          {item.code} Certification
        </p>
        <h3 className="mt-1 pr-6 text-base font-semibold">{displayTitle(item.title)}</h3>
        <p className="mt-2 text-sm text-white/70 line-clamp-3">{item.summary}</p>
      </div>
      <div className="mt-6">
        <p className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80">
          Next cohort - {formatShortDate(item.cohortStartsOn)}
        </p>
        <Link
          href={`/programms/${item.slug}`}
          className="mt-3 flex items-center justify-center gap-1 rounded-full bg-glass px-4 py-2.5 text-sm font-medium text-deep-blue hover:opacity-90"
        >
          Learn More →
        </Link>
      </div>
    </div>
  );
}

function GuestCart() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);

  const totalsByCurrency = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.priceCurrency] = (acc[item.priceCurrency] ?? 0) + (parseFloat(item.priceAmount) || 0);
    return acc;
  }, {});
  const currencies = Object.keys(totalsByCurrency);

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <GuestItemCard
            key={item.cohortId}
            item={item}
            onRemove={() => removeItem(item.cohortId)}
          />
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
        <div className="mt-5 flex flex-col gap-3 text-sm">
          {currencies.map((currency) => (
            <div key={currency} className="flex items-center justify-between">
              <span className="text-gray-500">
                Sub total{currencies.length > 1 ? ` (${currency})` : ""}
              </span>
              <span className="font-medium text-gray-900">
                {formatMoney(totalsByCurrency[currency], currency)}
              </span>
            </div>
          ))}
          <input
            disabled
            title="Log in to apply a coupon"
            placeholder="Enter Coupon Code"
            className="mt-1 w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          />
          <div className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-3">
            {currencies.map((currency) => (
              <div key={currency} className="flex items-center justify-between text-base">
                <span className="font-semibold text-gray-900">
                  Total{currencies.length > 1 ? ` (${currency})` : ""}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(totalsByCurrency[currency], currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/login?next=/cart"
          className="mt-6 block w-full rounded-md bg-main py-3.5 text-center text-sm font-semibold text-white hover:bg-deep-blue"
        >
          Log in to check out
        </Link>
        <p className="mt-2 text-center text-xs text-gray-400">
          Your cart is saved and will be waiting after you sign in.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- server cart */

function ServerItemCard({
  line,
  currency,
  onRemove,
  removing,
}: {
  line: CartItemLine;
  currency: string;
  onRemove: () => void;
  removing: boolean;
}) {
  const badge = certificateProviderLabel(line.program.certificate_provider);

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl bg-linear-to-br from-main to-deep-blue p-5 text-white ${
        line.available ? "" : "opacity-60"
      }`}
    >
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        aria-label="Remove from cart"
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-50"
      >
        <TrashIcon />
      </button>
      <div >
        {badge && (
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            {badge}
          </span>
        )}
        <h3 className="mt-5 pr-6 text-base font-semibold">{displayTitle(line.program.title)}</h3>
        <p className="mt-2 text-sm text-white/70">
          {formatShortDate(line.cohort.starts_on)} – {formatShortDate(line.cohort.ends_on)}
        </p>
        {!line.available && line.unavailable_reason && (
          <p className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100">
            {line.unavailable_reason}
          </p>
        )}
      </div>
      <div className="mt-6 flex flex-col items-cente justify-between gap-2">
        <span className="text-lg font-semibold">
          {line.amount != null ? formatCurrency(line.amount, currency) : "—"}
        </span>
        <Link
          href={`/programms/${line.program.slug}`}
          className="rounded-full bg-glass px-4 py-2 text-sm font-medium text-deep-blue hover:opacity-90 w-full text-center"
        >
          Learn More →
        </Link>
      </div>
    </div>
  );
}

function ServerCart() {
  const queryClient = useQueryClient();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const { data: cart, isLoading, isError } = useCart({
    coupon: appliedCoupon || undefined,
  });
  const removeItem = useRemoveCartItem();
  const emptyCart = useEmptyCart();
  const checkout = useCheckoutCart();

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="mt-16 text-center text-sm text-gray-500">
        We couldn&apos;t load your cart. Please refresh and try again.
      </p>
    );
  }

  if (!cart || cart.items.length === 0) return <EmptyCart />;

  const discount = parseFloat(cart.discount_amount) || 0;
  const couponRejected = !!cart.coupon && !cart.coupon.applied;

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return;
    setAppliedCoupon(code);
  };

  const clearCoupon = () => {
    setCouponInput("");
    setAppliedCoupon("");
  };

  const onCheckout = () => {
    checkout.mutate(
      { coupon_code: appliedCoupon || undefined },
      {
        onSuccess: (res) => {
          try {
            sessionStorage.setItem("checkout_order_id", String(res.order_id));
          } catch {
            // sessionStorage can be unavailable (privacy mode) — the confirm screen
            // falls back to the single-item verify flow if the id isn't there.
          }
          window.location.href = res.gateway_url;
        },
        onError: (err) => {
          const body = err.data as { item_errors?: Record<string, string> } | undefined;
          if (body?.item_errors && Object.keys(body.item_errors).length > 0) {
            toast.error(Object.values(body.item_errors).join(" • "));
            queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
          } else {
            toast.error(err.message);
          }
        },
      },
    );
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cart.items.map((line) => (
            <ServerItemCard
              key={line.id}
              line={line}
              currency={cart.currency}
              removing={removeItem.isPending}
              onRemove={() => removeItem.mutate(line.cohort.id)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => emptyCart.mutate()}
          disabled={emptyCart.isPending}
          className="mt-5 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          Empty cart
        </button>
      </div>

      <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
        <div className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Sub total ({cart.item_count} item{cart.item_count === 1 ? "" : "s"})</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(cart.subtotal, cart.currency)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-green-700">
              <span>Discount{cart.coupon?.applied ? ` (${cart.coupon.code})` : ""}</span>
              <span className="font-medium">−{formatCurrency(cart.discount_amount, cart.currency)}</span>
            </div>
          )}

          <div className="mt-1 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
              placeholder="Enter Coupon Code"
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={clearCoupon}
                className="shrink-0 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={applyCoupon}
                className="shrink-0 rounded-md bg-main px-4 text-sm font-medium text-white hover:bg-deep-blue"
              >
                Apply
              </button>
            )}
          </div>
          {cart.coupon?.applied && (
            <p className="text-xs font-medium text-green-700">
              Coupon “{cart.coupon.code}” applied.
            </p>
          )}
          {couponRejected && (
            <p className="text-xs font-medium text-red-500">
              {cart.coupon?.error ?? "That coupon code isn't valid."}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 text-base">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(cart.total, cart.currency)}
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={onCheckout}
          loading={checkout.isPending}
          className="mt-6 py-3.5"
        >
          Check Out
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ page */

const CartPage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Your shopping cart</h1>
      {user ? <ServerCart /> : <GuestCart />}
    </div>
  );
};

export default CartPage;
