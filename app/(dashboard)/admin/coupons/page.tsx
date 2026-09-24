"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCoupons } from "@/hooks/queries/coupon";
import { useDeleteCoupon } from "@/hooks/mutations/coupon";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { EyeIcon } from "@/components/ui/eye-icon";
import { TrashIcon } from "@/components/ui/trash-icon";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Modal } from "@/components/ui/modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
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

function ViewCouponModal({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const status = couponStatus(coupon);
  return (
    <Modal open onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{coupon.description}</h2>
        <div className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Code</span>
            <span className="font-medium text-gray-900">{coupon.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Discount</span>
            <span className="font-medium text-gray-900">{discountLabel(coupon)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Used</span>
            <span className="font-medium text-gray-900">
              {coupon.uses_count} / {coupon.max_uses ?? "Unlimited"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max uses per member</span>
            <span className="font-medium text-gray-900">{coupon.max_uses_per_user}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Valid from</span>
            <span className="font-medium text-gray-900">
              {coupon.valid_from ? formatOrdinalDateTime(coupon.valid_from) : "No start restriction"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Valid until</span>
            <span className="font-medium text-gray-900">
              {coupon.valid_until ? formatOrdinalDateTime(coupon.valid_until) : "No expiry"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="shrink-0 text-gray-400">Applies to</span>
            <span className="text-right font-medium text-gray-900">
              {coupon.applicable_programs.length === 0
                ? "All programs"
                : coupon.applicable_programs.map((p) => p.title).join(", ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
          {coupon.program_discounts.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
              <span className="text-gray-400">Program overrides</span>
              {coupon.program_discounts.map((d) => (
                <div key={d.id} className="flex justify-between">
                  <span className="text-gray-600">{d.program.title}</span>
                  <span className="font-medium text-gray-900">
                    {coupon.discount_type === "fixed_amount"
                      ? `${coupon.currency} ${d.discount_value}`
                      : `${d.discount_value}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

const CouponsPage = () => {
  const { data: coupons, isLoading } = useCoupons();
  const [viewTarget, setViewTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCoupon.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Coupon deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

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
            {isLoading && <TableSkeletonRows columns={COLUMNS.length} />}
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
                  <td className="max-w-xs px-5 py-4 text-gray-900">
                    <p className="line-clamp-2">{coupon.description}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{coupon.code}</td>
                  <td className="px-5 py-4 text-gray-600">{discountLabel(coupon)}</td>
                  <td className="px-5 py-4 text-gray-600">{coupon.uses_count}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={status.label} tone={status.tone} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(coupon.updated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewTarget(coupon)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="View coupon"
                      >
                        <EyeIcon />
                      </button>
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Edit coupon"
                      >
                        <PencilIcon />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(coupon)}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Delete coupon"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewTarget && <ViewCouponModal coupon={viewTarget} onClose={() => setViewTarget(null)} />}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete coupon"
        description={`Are you sure you want to delete "${deleteTarget?.code}"? This can't be undone.`}
        loading={deleteCoupon.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CouponsPage;
