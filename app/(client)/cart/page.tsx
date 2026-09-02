"use client";

import Link from "next/link";
import { useCartStore, type CartItem } from "@/lib/store/cartStore";
import { displayTitle, formatShortDate, formatMoney } from "@/lib/format";

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
      <path
        d="M10 22h30l6 6h8a2 2 0 012 2v20a4 4 0 01-4 4H14a4 4 0 01-4-4V22z"
        fill="#00AFEB"
      />
      <path d="M10 22a4 4 0 014-4h10l4 5" fill="#00AFEB" />
      <circle cx="42" cy="42" r="9" fill="white" />
      <circle cx="42" cy="42" r="6" stroke="#0c236c" strokeWidth="2" />
      <path d="M46.5 46.5L51 51" stroke="#0c236c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartItemCard({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
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

const CartPage = () => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);

  // Cohorts can be priced in different currencies, so totals are kept per currency rather than
  // blended into one number — there's no confirmed exchange rate to convert them honestly.
  const totalsByCurrency = items.reduce<Record<string, number>>((acc, item) => {
    const amount = parseFloat(item.priceAmount) || 0;
    acc[item.priceCurrency] = (acc[item.priceCurrency] ?? 0) + amount;
    return acc;
  }, {});
  const currencies = Object.keys(totalsByCurrency);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Your shopping cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <EmptyCartIcon />
          <p className="max-w-xs text-sm text-gray-500">
            Your cart is empty. Please add course to your cart to place order
          </p>
          <Link
            href="/programms"
            className="rounded-md bg-main px-8 py-3 text-sm font-medium text-white hover:bg-deep-blue"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <CartItemCard
                key={item.programId}
                item={item}
                onRemove={() => removeItem(item.programId)}
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
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Estimated Tax</span>
                <span className="font-medium text-gray-900">—</span>
              </div>
              <input
                disabled
                title="Coupon codes aren't supported for multi-item carts yet"
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
            <button
              type="button"
              disabled
              title="Cart checkout isn't connected yet — no multi-item checkout API exists"
              className="mt-6 w-full rounded-md bg-main py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
