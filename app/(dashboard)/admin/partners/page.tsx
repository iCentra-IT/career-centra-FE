"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useReferralPartners } from "@/hooks/queries/referral-partner";
import { useDeleteReferralPartner } from "@/hooks/mutations/referral-partner";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { EyeIcon } from "@/components/ui/eye-icon";
import { TrashIcon } from "@/components/ui/trash-icon";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { formatOrdinalDateTime } from "@/lib/format";
import type { ReferralPartner } from "@/types/referral-partner";

const COLUMNS = ["Partner", "Coupon Code", "Contact Email", "Status", "Updated", "Action"];

const AdminReferralPartnersPage = () => {
  const { data: partners, isLoading } = useReferralPartners();
  const [deleteTarget, setDeleteTarget] = useState<ReferralPartner | null>(null);
  const deletePartner = useDeleteReferralPartner();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePartner.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Partner deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Referral Partners</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage organizations with a dedicated program catalog and discount code — e.g. PMI
            Dallas members at /partners/&lt;slug&gt;.
          </p>
        </div>
        <Link
          href="/admin/partners/create"
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Onboard Partner
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
            {!isLoading && partners?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No referral partners yet.
                </td>
              </tr>
            )}
            {partners?.map((partner) => (
              <tr key={partner.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4 text-gray-900">
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-xs text-gray-400">/partners/{partner.slug}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{partner.coupon_code}</td>
                <td className="px-5 py-4 text-gray-600">{partner.contact_email || "—"}</td>
                <td className="px-5 py-4">
                  {partner.is_active ? (
                    <StatusBadge label="Active" tone="green" />
                  ) : (
                    <StatusBadge label="Inactive" tone="gray" />
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(partner.updated_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/partners/${partner.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="View partner page"
                    >
                      <EyeIcon />
                    </Link>
                    <Link
                      href={`/admin/partners/${partner.id}/edit`}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Edit partner"
                    >
                      <PencilIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(partner)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Delete partner"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete referral partner"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This can't be undone.`}
        loading={deletePartner.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminReferralPartnersPage;
