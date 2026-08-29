"use client";

import Link from "next/link";
import { useCoupons } from "@/hooks/queries/coupon";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { formatOrdinalDateTime } from "@/lib/format";
import type { Coupon } from "@/types/coupon";

const COLUMNS = ["Discount Name", "Code", "Discount", "Total Used", "Status", "Update", "Action"];

function couponStatus(coupon: Coupon) {
  if (!coupon.is_active) return { label: "Inactive", tone: "gray" as const };
  if (coupon.valid_until && new Date(coupon.valid_until).getTime() < Date.now()) {
    return { label: "Expired", tone: "yellow" as const };
  }
  return { label: "Active", tone: "green" as const };
}

function discountLabel(coupon: Coupon) {
  return coupon.discount_type === "fixed_amount"
    ? `${coupon.currency} ${coupon.discount_value}`
    : `${coupon.discount_value}%`;
}

const CouponsPage = () => {
  const { data: coupons, isLoading } = useCoupons();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit and publish Career Path.</p>
        </div>
        <Link
          href="/admin/coupons/create"
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Create Coupons
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
              {COLUMNS.map((col) => (
                <th key={col} className="px-5 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && coupons?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons?.map((coupon) => {
              const status = couponStatus(coupon);
              return (
                <tr key={coupon.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900">{coupon.description}</td>
                  <td className="px-5 py-4 text-gray-600">{coupon.code}</td>
                  <td className="px-5 py-4 text-gray-600">{discountLabel(coupon)}</td>
                  <td className="px-5 py-4 text-gray-600">{coupon.uses_count}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={status.label} tone={status.tone} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(coupon.updated_at)}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/coupons/${coupon.id}/edit`}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Edit coupon"
                    >
                      <PencilIcon />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponsPage;
