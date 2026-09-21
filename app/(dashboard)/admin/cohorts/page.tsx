"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCohorts } from "@/hooks/queries/cohort";
import { useDeleteCohort } from "@/hooks/mutations/cohort";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { EyeIcon } from "@/components/ui/eye-icon";
import { TrashIcon } from "@/components/ui/trash-icon";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Modal } from "@/components/ui/modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { formatDateRange } from "@/lib/format";
import type { Cohort } from "@/types/cohort";

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const COLUMNS = [
  "Program",
  "Cohort dates",
  "Capacity",
  "Sold",
  "Remaining",
  "Status",
  "Facilitator",
  "Action",
];

const STATUS_OPTIONS = ["Active", "Full", "Inactive"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

function cohortStatus(cohort: { is_sold_out: boolean; is_active: boolean }): StatusOption {
  if (cohort.is_sold_out) return "Full";
  if (cohort.is_active) return "Active";
  return "Inactive";
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 3h12M4.5 8h7M7 13h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ViewCohortModal({ cohort, onClose }: { cohort: Cohort; onClose: () => void }) {
  return (
    <Modal open onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{cohort.program.title}</h2>
        <div className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Dates</span>
            <span className="font-medium text-gray-900">
              {formatDateRange(cohort.starts_on, cohort.ends_on)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Capacity</span>
            <span className="font-medium text-gray-900">{cohort.seat_capacity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sold</span>
            <span className="font-medium text-gray-900">{cohort.seats_taken}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining</span>
            <span className="font-medium text-gray-900">{cohort.seats_remaining}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Facilitator</span>
            <span className="font-medium text-gray-900">{cohort.facilitator_name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            {cohortStatus(cohort) === "Full" ? (
              <StatusBadge label="Full" tone="purple" />
            ) : cohortStatus(cohort) === "Active" ? (
              <StatusBadge label="Active" tone="green" />
            ) : (
              <StatusBadge label="Inactive" tone="gray" />
            )}
          </div>
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

const AdminCohortsPage = () => {
  const [page, setPage] = useState(1);
  const { data: cohorts, isLoading } = useCohorts(page);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<StatusOption>>(new Set());
  const [viewTarget, setViewTarget] = useState<Cohort | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cohort | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const deleteCohort = useDeleteCohort();

  useEffect(() => {
    if (!filterOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [filterOpen]);

  const filtered = useMemo(() => {
    let list = cohorts?.results ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.program.title.toLowerCase().includes(q));
    }
    if (statusFilters.size > 0) {
      list = list.filter((c) => statusFilters.has(cohortStatus(c)));
    }
    return list;
  }, [cohorts, search, statusFilters]);

  const toggleStatus = (status: StatusOption) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCohort.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Cohort deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Cohorts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Schedule cohorts, set capacity and assign facilitators.
          </p>
        </div>
        <Link
          href="/admin/cohorts/create"
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Add Cohort
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Cohorts"
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>

        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FilterIcon />
            Filter
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
              <div className="mt-2 flex flex-col gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <label key={status} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={statusFilters.has(status)}
                      onChange={() => toggleStatus(status)}
                      className="h-4 w-4 rounded border-gray-300 text-main focus:ring-secondary"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
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
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No cohorts match.
                </td>
              </tr>
            )}
            {filtered.map((cohort) => (
              <tr key={cohort.id} className="border-b border-gray-50 last:border-0">
                <td className="max-w-55 truncate px-5 py-4 text-gray-900">{cohort.program.title}</td>
                <td className="px-5 py-4 text-gray-600">
                  {formatDateRange(cohort.starts_on, cohort.ends_on)}
                </td>
                <td className="px-5 py-4 text-gray-600">{cohort.seat_capacity}</td>
                <td className="px-5 py-4 text-gray-600">{cohort.seats_taken}</td>
                <td className="px-5 py-4 text-gray-600">{cohort.seats_remaining}</td>
                <td className="px-5 py-4">
                  {cohortStatus(cohort) === "Full" ? (
                    <StatusBadge label="Full" tone="purple" />
                  ) : cohortStatus(cohort) === "Active" ? (
                    <StatusBadge label="Active" tone="green" />
                  ) : (
                    <StatusBadge label="Inactive" tone="gray" />
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{cohort.facilitator_name}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewTarget(cohort)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="View cohort"
                    >
                      <EyeIcon />
                    </button>
                    <Link
                      href={`/admin/cohorts/${cohort.id}/edit`}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Edit cohort"
                    >
                      <PencilIcon />
                    </Link>
                    <Link
                      href={`/admin/cohorts/${cohort.id}/edit#sessions`}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Manage class sessions"
                      title="Class sessions"
                    >
                      <CalendarIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cohort)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Delete cohort"
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

      {!isLoading && (cohorts?.total_pages ?? 1) > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination page={page} totalPages={cohorts?.total_pages ?? 1} onPageChange={setPage} />
        </div>
      )}

      {viewTarget && <ViewCohortModal cohort={viewTarget} onClose={() => setViewTarget(null)} />}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete cohort"
        description={`Are you sure you want to delete this cohort of "${deleteTarget?.program.title}"? This can't be undone.`}
        loading={deleteCohort.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminCohortsPage;
