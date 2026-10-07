"use client";

import { useState } from "react";
import { usePurchaseHistory } from "@/hooks/queries/students";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { formatMoney, formatOrdinalDateTime } from "@/lib/format";

const STATUS_TONES: Record<string, "green" | "yellow" | "red" | "purple" | "gray"> = {
  successful: "green",
  pending: "yellow",
  failed: "red",
  disputed: "purple",
  refunded: "gray",
};

// Raw status values the backend actually sends (see apps.students.serializers.
// PURCHASE_STATUS_LABELS) — "confirmed" reads as a payment success here, not an enrollment state.
const STATUS_FILTERS = [
  { value: "confirmed", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "all", label: "All" },
] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const COLUMNS = ["Program", "Date", "Amount Paid", "Reference ID", "Payment Provider", "Status"];

const PurchaseHistoryPage = () => {
  const { data, isLoading } = usePurchaseHistory();
  const results = data?.results ?? [];
  // Defaults to confirmed (successful) payments — pending/failed attempts are still one filter
  // away, but a student opening this page is almost always checking what they've actually paid
  // for, not reviewing abandoned/failed attempts.
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["value"]>("confirmed");
  const filteredResults =
    statusFilter === "all" ? results : results.filter((item) => item.status === statusFilter);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Purchase history</h1>
      <p className="mt-1 text-sm text-gray-500">Download and verify your earned certifications.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total payment" value={data?.stats.total} loading={isLoading} />
        <StatCard label="Successful Payment" value={data?.stats.successful} loading={isLoading} />
        <StatCard label="Failed Payment" value={data?.stats.failed} loading={isLoading} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === f.value ? "bg-main text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
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
            {!isLoading && filteredResults.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  {statusFilter === "all"
                    ? "No purchases yet."
                    : `No ${STATUS_FILTERS.find((f) => f.value === statusFilter)?.label.toLowerCase()} purchases yet.`}
                </td>
              </tr>
            )}
            {filteredResults.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4 text-gray-900">{item.program_title}</td>
                <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(item.date)}</td>
                <td className="px-5 py-4 text-gray-900">{formatMoney(item.amount_paid, item.currency)}</td>
                <td className="px-5 py-4 text-gray-600">{item.reference}</td>
                <td className="px-5 py-4 text-gray-600">{capitalize(item.payment_provider)}</td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={item.status_label}
                    tone={STATUS_TONES[item.status] ?? "gray"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;
