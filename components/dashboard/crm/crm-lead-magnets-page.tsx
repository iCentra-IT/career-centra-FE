"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useLeadMagnets } from "@/hooks/queries/crm";
import { useDeleteLeadMagnet } from "@/hooks/mutations/crm";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatOrdinalDateTime } from "@/lib/format";
import type { LeadMagnet } from "@/types/crm";

const COLUMNS = ["Title", "Slug", "Status", "Created", "Action"];

export function CrmLeadMagnetsPage({ basePath }: { basePath: string }) {
  const { data: magnets, isLoading } = useLeadMagnets();
  const deleteMagnet = useDeleteLeadMagnet();
  const [deleteTarget, setDeleteTarget] = useState<LeadMagnet | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Lead Magnets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gated downloads (guides, checklists). Visitors enter their email before they can download.
          </p>
        </div>
        <Link
          href={`${basePath}/lead-magnets/create`}
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          New Lead Magnet
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
            {isLoading && <TableSkeleton columns={COLUMNS} />}
            {!isLoading && magnets?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No lead magnets yet.
                </td>
              </tr>
            )}
            {magnets?.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{m.title}</p>
                  {m.description && <p className="line-clamp-1 text-xs text-gray-400">{m.description}</p>}
                </td>
                <td className="px-5 py-4 font-mono text-xs text-gray-500">{m.slug}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={m.is_active ? "Active" : "Inactive"} tone={m.is_active ? "green" : "gray"} />
                </td>
                <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(m.created_at)}</td>
                <td className="px-5 py-4">
                  <ActionsMenu
                    items={[
                      { label: "Edit", onClick: () => (window.location.href = `${basePath}/lead-magnets/${m.slug}/edit`) },
                      { label: "Delete", tone: "danger", onClick: () => setDeleteTarget(m) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete lead magnet"
        description={`Delete "${deleteTarget?.title}" and its uploaded file? Download links already in people's inboxes will stop working.`}
        loading={deleteMagnet.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMagnet.mutate(deleteTarget.slug, {
            onSuccess: () => {
              toast.success("Lead magnet deleted.");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
