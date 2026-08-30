"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useCohorts } from "@/hooks/queries/cohort";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/format";

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

const AdminCohortsPage = () => {
  const { data: cohorts, isLoading } = useCohorts();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<StatusOption>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

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
          Add Program
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
                <td className="px-5 py-4 text-gray-900">{cohort.program.title}</td>
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
                  <Link
                    href={`/admin/cohorts/${cohort.id}/edit`}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Edit cohort"
                  >
                    <PencilIcon />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCohortsPage;
