"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminLearners } from "@/hooks/queries/admin-learners";
import { useDeleteAdminUser } from "@/hooks/mutations/admin-users";
import { EmptyTableState } from "@/components/ui/empty-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { TrashIcon } from "@/components/ui/trash-icon";
import { formatShortDate } from "@/lib/format";
import type { AdminLearner } from "@/types/learner";

const COLUMNS = ["Name", "Email", "Location", "Certificates", "Enrollments", "Joined", "Status", "Action"];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  if (status === "active") return "green";
  if (status === "pending_verification") return "yellow";
  if (status === "suspended") return "red";
  return "gray";
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminLearner | null>(null);
  const { data: learners, isLoading } = useAdminLearners();
  const deleteUser = useDeleteAdminUser();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Account deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const filtered = useMemo(() => {
    const list = learners ?? [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (l) => l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q),
    );
  }, [learners, search]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">View and manage registered learner accounts.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name"
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : filtered.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No learner accounts match yet." />
        ) : (
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
              {filtered.map((learner) => (
                <tr key={learner.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900">{learner.full_name}</td>
                  <td className="px-5 py-4 text-gray-600">{learner.email}</td>
                  <td className="px-5 py-4 text-gray-600">{learner.location || "—"}</td>
                  <td className="px-5 py-4 text-gray-600">{learner.certificate_count}</td>
                  <td className="px-5 py-4 text-gray-600">{learner.enrollment_count}</td>
                  <td className="px-5 py-4 text-gray-600">{formatShortDate(learner.date_joined)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={statusLabel(learner.status)} tone={statusTone(learner.status)} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(learner)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Delete account"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete account"
        description={`Are you sure you want to delete "${deleteTarget?.full_name}"? This can't be undone.`}
        loading={deleteUser.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
