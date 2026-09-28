"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminLearners } from "@/hooks/queries/admin-learners";
import {
  useDeactivateUser,
  useReactivateUser,
  useResendUserVerification,
  useDeleteUserPermanently,
} from "@/hooks/mutations/admin-users";
import { EmptyTableState } from "@/components/ui/empty-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ActionsMenu, type ActionMenuItem } from "@/components/ui/actions-menu";
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

// Deactivate/reactivate/resend-verification/delete are all confirmed real, work on any user type
// (not just learners), and are distinct endpoints from each other — deactivate is a DELETE verb
// but only blocks login, it doesn't remove the account; the real delete is a separate endpoint.
function LearnerActions({ learner, onDeleteRequest }: { learner: AdminLearner; onDeleteRequest: () => void }) {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const resendVerification = useResendUserVerification();

  const handleReactivate = () => {
    reactivate.mutate(learner.id, {
      onSuccess: () => toast.success(`${learner.full_name} reactivated.`),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDeactivate = () => {
    deactivate.mutate(learner.id, {
      onSuccess: () => {
        toast.success(`${learner.full_name} deactivated.`);
        setConfirmDeactivate(false);
      },
      onError: (err) => {
        toast.error(err.message);
        setConfirmDeactivate(false);
      },
    });
  };

  const handleResendVerification = () => {
    resendVerification.mutate(learner.id, {
      onSuccess: () => toast.success(`Verification email resent to ${learner.email}.`),
      onError: (err) => toast.error(err.message),
    });
  };

  const items: ActionMenuItem[] = [];
  if (learner.status === "pending_verification") {
    items.push({
      label: resendVerification.isPending ? "Sending…" : "Resend Verification",
      onClick: handleResendVerification,
      disabled: resendVerification.isPending,
    });
  }
  if (learner.is_active) {
    items.push({ label: "Deactivate", onClick: () => setConfirmDeactivate(true), tone: "danger" });
  } else {
    items.push({
      label: reactivate.isPending ? "Reactivating…" : "Reactivate",
      onClick: handleReactivate,
      disabled: reactivate.isPending,
      tone: "success",
    });
  }
  items.push({ label: "Delete Permanently", onClick: onDeleteRequest, tone: "danger" });

  return (
    <>
      <ActionsMenu items={items} />
      <ConfirmDeleteModal
        open={confirmDeactivate}
        title="Deactivate this account?"
        description={`${learner.full_name} won't be able to log in until it's reactivated.`}
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        onConfirm={handleDeactivate}
        onClose={() => setConfirmDeactivate(false)}
      />
    </>
  );
}

const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminLearner | null>(null);
  const { data: learners, isLoading } = useAdminLearners();
  const deleteUser = useDeleteUserPermanently();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Account permanently deleted.");
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
                    <LearnerActions learner={learner} onDeleteRequest={() => setDeleteTarget(learner)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Permanently delete account"
        description={`This will permanently delete "${deleteTarget?.full_name}". This can't be undone — use Deactivate instead if you just want to block their access.`}
        confirmLabel="Delete Permanently"
        loading={deleteUser.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
