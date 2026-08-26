"use client";

import { useCohorts } from "@/hooks/queries/cohort";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
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

const AdminCohortsPage = () => {
  const { data: cohorts, isLoading } = useCohorts();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Cohorts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Schedule cohorts, set capacity and assign facilitators.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white opacity-90 disabled:cursor-not-allowed"
        >
          Add Cohort
        </button>
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
            {!isLoading && cohorts?.results?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No cohorts yet.
                </td>
              </tr>
            )}
            {cohorts?.results?.map((cohort) => (
              <tr key={cohort.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4 text-gray-900">{cohort.program.title}</td>
                <td className="px-5 py-4 text-gray-600">
                  {formatDateRange(cohort.starts_on, cohort.ends_on)}
                </td>
                <td className="px-5 py-4 text-gray-600">{cohort.seat_capacity}</td>
                <td className="px-5 py-4 text-gray-600">{cohort.seats_taken}</td>
                <td className="px-5 py-4 text-gray-600">{cohort.seats_remaining}</td>
                <td className="px-5 py-4">
                  {cohort.is_sold_out ? (
                    <StatusBadge label="Full" tone="purple" />
                  ) : cohort.is_active ? (
                    <StatusBadge label="Active" tone="green" />
                  ) : (
                    <StatusBadge label="Inactive" tone="gray" />
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{cohort.facilitator_name}</td>
                <td className="px-5 py-4">
                  <button type="button" disabled title="Editing coming soon" className="text-gray-400">
                    <PencilIcon />
                  </button>
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
