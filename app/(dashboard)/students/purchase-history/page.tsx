"use client";

import { usePurchaseHistory } from "@/hooks/queries/students";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatOrdinalDateTime } from "@/lib/format";

const STATUS_TONES: Record<string, "green" | "yellow" | "red" | "purple" | "gray"> = {
  successful: "green",
  pending: "yellow",
  failed: "red",
  disputed: "purple",
  refunded: "gray",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const COLUMNS = ["Program", "Date", "Amount Paid", "Reference ID", "Payment Provider", "Status"];

const PurchaseHistoryPage = () => {
  const { data, isLoading } = usePurchaseHistory();
  const results = data?.results ?? [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Purchase history</h1>
      <p className="mt-1 text-sm text-gray-500">Download and verify your earned certifications.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total payment" value={data?.stats.total} loading={isLoading} />
        <StatCard label="Successful Payment" value={data?.stats.successful} loading={isLoading} />
        <StatCard label="Failed Payment" value={data?.stats.failed} loading={isLoading} />
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
            {!isLoading && results.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No purchases yet.
                </td>
              </tr>
            )}
            {results.map((item) => (
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
