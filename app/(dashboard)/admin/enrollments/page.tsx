"use client";

import { useMemo, useState } from "react";
import { useAdminEnrollments } from "@/hooks/queries/admin-enrollments";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyTableState } from "@/components/ui/empty-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatMoney, formatShortDate } from "@/lib/format";

const COLUMNS = ["User Name", "Program", "Amount Paid", "Payment Provider", "Date", "Status"];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  const s = status.toLowerCase();
  if (s === "successful" || s === "confirmed" || s === "completed") return "green";
  if (s === "pending") return "yellow";
  if (s === "failed" || s === "cancelled") return "red";
  return "gray";
}

const AdminEnrollmentsPage = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminEnrollments();

  const filtered = useMemo(() => {
    const results = data?.results ?? [];
    if (!search.trim()) return results;
    const q = search.trim().toLowerCase();
    return results.filter(
      (e) => e.learner_name.toLowerCase().includes(q) || e.program_title.toLowerCase().includes(q),
    );
  }, [data, search]);

  // Approximation: derived from the currently loaded page, not a dedicated stats endpoint.
  const successful = (data?.results ?? []).filter((e) => statusTone(e.status) === "green").length;
  const pending = (data?.results ?? []).filter((e) => statusTone(e.status) === "yellow").length;
  const failed = (data?.results ?? []).filter((e) => statusTone(e.status) === "red").length;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Enrolments History</h1>
      <p className="mt-1 text-sm text-gray-500">Track enrolments and payments across the platform.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Enrolment" value={data?.count} loading={isLoading} />
        <StatCard label="Successful" value={successful} loading={isLoading} note="From loaded page" />
        <StatCard label="Pending" value={pending} loading={isLoading} note="From loaded page" />
        <StatCard label="Failed" value={failed} loading={isLoading} note="From loaded page" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : filtered.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No enrolments match yet." />
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
              {filtered.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900">{enrollment.learner_name}</td>
                  <td className="px-5 py-4 text-gray-600">{enrollment.program_title}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {formatMoney(enrollment.amount_paid, enrollment.currency)}
                  </td>
                  <td className="px-5 py-4 capitalize text-gray-600">{enrollment.payment_gateway}</td>
                  <td className="px-5 py-4 text-gray-600">{formatShortDate(enrollment.created_at)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={enrollment.status} tone={statusTone(enrollment.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
