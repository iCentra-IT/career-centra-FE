"use client";

import { usePrograms } from "@/hooks/queries/programs";
import { useCohorts } from "@/hooks/queries/cohort";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyTableState } from "@/components/ui/empty-table";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const AdminOverviewPage = () => {
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts();

  const activeCohorts = cohorts?.results?.filter((c) => c.is_active && !c.is_sold_out) ?? [];
  const nearlyFullCohorts = cohorts?.results?.filter((c) => c.is_nearly_full) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Overview</h1>
      <p className="mt-1 text-sm text-gray-500">Platform performance at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total programs" value={programs?.count} loading={programsLoading} />
        <StatCard label="Total revenue" note="No revenue endpoint yet" />
        <StatCard
          label="Active cohorts"
          value={activeCohorts.length}
          loading={cohortsLoading}
        />
        <StatCard label="Total enrollments" note="No admin-wide enrollments endpoint yet" />
        <StatCard label="Recent payments" note="No payments endpoint yet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Recent enrollments">
          <EmptyTableState
            columns={["Student Name", "Program", "Amount Paid", "Status"]}
            message="Not connected — enrollments API has no student identity or admin-wide scope yet."
          />
        </Panel>
        <Panel title="Recent facilitator applications">
          <EmptyTableState
            columns={["Applicant", "Domains", "Status"]}
            message="Not connected — no facilitator applications API exists yet."
          />
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Payment status summary">
          <p className="py-6 text-center text-xs text-gray-400">
            No payments/status aggregation endpoint yet.
          </p>
        </Panel>

        <Panel title="Low seat alert">
          <p className="mb-4 text-sm text-gray-500">These cohorts are almost full.</p>
          {cohortsLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : nearlyFullCohorts.length ? (
            <ul className="flex flex-col gap-3">
              {nearlyFullCohorts.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{c.program.title}</span>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    {c.seats_remaining} of {c.seat_capacity} seats left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No cohorts are close to full right now.</p>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
