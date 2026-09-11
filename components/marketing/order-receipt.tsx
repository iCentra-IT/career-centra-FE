"use client";

import Link from "next/link";
import { useOrder } from "@/hooks/queries/orders";
import { useAuthStore } from "@/lib/store/authStore";
import { displayTitle, formatShortDate, formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/types/cart";

function statusTone(status: OrderStatus): "green" | "yellow" | "red" | "gray" {
  if (status === "confirmed") return "green";
  if (status === "pending") return "yellow";
  if (status === "failed") return "red";
  return "gray";
}

export function OrderReceipt({ orderId }: { orderId: number }) {
  const user = useAuthStore((s) => s.user);
  const { data: order, isLoading, isError } = useOrder(orderId);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm text-gray-500">
          Please{" "}
          <Link href={`/login?next=/orders/${orderId}`} className="font-medium text-secondary hover:underline">
            log in
          </Link>{" "}
          to view this order.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Order not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This order doesn&apos;t exist or isn&apos;t yours to view.
        </p>
        <Link
          href="/students/purchase-history"
          className="mt-6 inline-block rounded-md bg-main px-6 py-3 text-sm font-medium text-white hover:bg-deep-blue"
        >
          View Purchase History
        </Link>
      </div>
    );
  }

  const discountTotal = parseFloat(order.discount_total) || 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {order.payment_reference} · {formatShortDate(order.created_at)}
            {order.payment_gateway ? ` · ${order.payment_gateway}` : ""}
          </p>
        </div>
        <StatusBadge
          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          tone={statusTone(order.status)}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
        {order.items.map((item, i) => {
          const original = parseFloat(item.original_amount ?? "") || 0;
          const lineDiscount = parseFloat(item.discount_amount ?? "") || 0;
          return (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 p-5 ${
                i > 0 ? "border-t border-gray-100" : ""
              }`}
            >
              <div className="min-w-0">
                <Link
                  href={`/programms/${item.program.slug}`}
                  className="text-sm font-semibold text-gray-900 hover:text-main"
                >
                  {displayTitle(item.program.title)}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  {formatShortDate(item.cohort.starts_on)} – {formatShortDate(item.cohort.ends_on)}
                </p>
                {item.cohort.facilitator_display?.[0]?.full_name && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.cohort.facilitator_display[0].full_name}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.amount_paid, item.currency)}
                </p>
                {lineDiscount > 0 && original > 0 && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatCurrency(item.original_amount, item.currency)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-col gap-2 text-sm">
          {order.coupon && (
            <div className="flex items-center justify-between text-green-700">
              <span>
                Coupon {order.coupon.code}
                {order.coupon.discount_type === "percentage"
                  ? ` (${parseFloat(order.coupon.discount_value)}% off)`
                  : ""}
              </span>
              {discountTotal > 0 && (
                <span className="font-medium">
                  −{formatCurrency(order.discount_total, order.currency)}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-base">
            <span className="font-semibold text-gray-900">Total paid</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(order.total_amount, order.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/students/enrolments"
          className="rounded-md bg-main px-6 py-3 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Go to My Enrolments
        </Link>
        <Link
          href="/programms"
          className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Browse more courses
        </Link>
      </div>
    </div>
  );
}
