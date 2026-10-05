"use client";

import { useAdminUserCart } from "@/hooks/queries/admin-carts";
import { Modal } from "@/components/ui/modal";
import { DetailPageSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { displayTitle, formatCurrency, formatShortDate } from "@/lib/format";

// Read-only view of a learner's cart. Marketers and admins both see it; nothing here mutates.
export function AdminCartModal({
  userId,
  learnerName,
  onClose,
}: {
  userId: number | null;
  learnerName?: string;
  onClose: () => void;
}) {
  const { data: cart, isLoading, isError, error } = useAdminUserCart(userId);

  return (
    <Modal open={userId !== null} onClose={onClose} size="lg">
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Cart{learnerName ? ` · ${learnerName}` : ""}</h2>

        {isLoading && <DetailPageSkeleton />}
        {isError && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

        {cart && (
          <div className="mt-4 flex flex-col gap-5">
            {cart.referral && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm">
                <StatusBadge label={`Partner: ${cart.referral.partner_name}`} tone="purple" />
                <span className="text-gray-600">
                  Pricing pinned to {cart.referral.pinned_currency}
                  {cart.referral.pricing_pinned ? "" : " (not pinned)"}
                </span>
              </div>
            )}

            {cart.items.length === 0 ? (
              <p className="text-sm text-gray-400">This cart is empty.</p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{displayTitle(item.program.title)}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatShortDate(item.cohort.starts_on)} – {formatShortDate(item.cohort.ends_on)} ·{" "}
                        {item.cohort.delivery_mode}
                        {item.cohort.location ? ` · ${item.cohort.location}` : ""}
                      </p>
                      {!item.available && item.unavailable_reason && (
                        <p className="mt-1 text-xs text-red-600">{item.unavailable_reason}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-medium text-gray-900">{formatCurrency(item.amount, cart.currency)}</p>
                      {parseFloat(item.discount_amount) > 0 && (
                        <p className="text-xs text-green-700">
                          −{formatCurrency(item.discount_amount, cart.currency)} discount
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="text-right text-gray-900">{formatCurrency(cart.subtotal, cart.currency)}</dd>
              <dt className="text-gray-500">
                Discount{cart.coupon?.applied ? ` (${cart.coupon.code})` : ""}
              </dt>
              <dd className="text-right text-gray-900">{formatCurrency(cart.discount_amount, cart.currency)}</dd>
              <dt className="font-semibold text-gray-900">Total</dt>
              <dd className="text-right font-semibold text-gray-900">{formatCurrency(cart.total, cart.currency)}</dd>
              <dt className="text-gray-500">Country</dt>
              <dd className="text-right text-gray-900">{cart.country_code || "—"}</dd>
            </dl>

            {cart.coupon && !cart.coupon.applied && cart.coupon.error && (
              <p className="text-xs text-red-600">Coupon {cart.coupon.code} not applied: {cart.coupon.error}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
