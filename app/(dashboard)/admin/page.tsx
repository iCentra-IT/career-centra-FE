"use client";

import { useCohorts } from "@/hooks/queries/cohort";
import { useAdminDashboard } from "@/hooks/queries/admin-dashboard";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyTableState } from "@/components/ui/empty-table";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { formatMoney, formatUsd } from "@/lib/format";

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

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  const s = status.toLowerCase();
  if (s === "successful" || s === "confirmed" || s === "completed" || s === "approved") return "green";
  if (s === "pending" || s === "submitted" || s === "under_review") return "yellow";
  if (s === "failed" || s === "cancelled" || s === "rejected") return "red";
  return "gray";
}

const AdminOverviewPage = () => {
  const { data: dashboard, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts();

  const nearlyFullCohorts = cohorts?.results?.filter((c) => c.is_nearly_full) ?? [];
  const recentEnrollments = (dashboard?.recent_enrollments ?? []).slice(0, 5);
  const recentFacilitators = (dashboard?.recent_facilitators ?? []).slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Overview</h1>
      <p className="mt-1 text-sm text-gray-500">Platform performance at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total programs"
          value={dashboard?.overview.total_programs}
          loading={dashboardLoading}
        />
        <StatCard
          label="Total revenue (NGN)"
          value={dashboard ? formatMoney(dashboard.overview.total_revenue_ngn, "NGN") : undefined}
          loading={dashboardLoading}
        />
        <StatCard
          label="Active cohorts"
          value={dashboard?.overview.active_cohorts}
          loading={dashboardLoading}
        />
        <StatCard
          label="Total enrollments"
          value={dashboard?.overview.total_enrollments}
          loading={dashboardLoading}
        />
        <StatCard
          label="Total revenue (USD)"
          value={dashboard ? formatUsd(dashboard.overview.total_revenue_usd) : undefined}
          loading={dashboardLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Recent enrollments">
          {dashboardLoading ? (
            <ListRowSkeleton rows={4} />
          ) : recentEnrollments.length === 0 ? (
            <EmptyTableState
              columns={["Student Name", "Program", "Amount Paid", "Status"]}
              message="No enrolments yet."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentEnrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{e.learner_name}</p>
                    <p className="truncate text-xs text-gray-400">{e.program_title}</p>
                  </div>
                  <StatusBadge label={e.status} tone={statusTone(e.status)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent facilitators">
          {dashboardLoading ? (
            <ListRowSkeleton rows={4} />
          ) : recentFacilitators.length === 0 ? (
            <EmptyTableState columns={["Facilitator", "Domains", "Status"]} message="No facilitators yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentFacilitators.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{f.full_name}</p>
                    <p className="truncate text-xs text-gray-400">{f.domains.join(", ")}</p>
                  </div>
                  <StatusBadge
                    label={f.is_published ? "Published" : "Unpublished"}
                    tone={f.is_published ? "green" : "gray"}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Payment status summary">
          {dashboardLoading ? (
            <ListRowSkeleton rows={3} />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <StatusBadge label="Confirmed" tone="green" />
                <span className="font-medium text-gray-900">
                  {dashboard?.payment_status_summary.confirmed ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <StatusBadge label="Pending" tone="yellow" />
                <span className="font-medium text-gray-900">
                  {dashboard?.payment_status_summary.pending ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <StatusBadge label="Failed" tone="red" />
                <span className="font-medium text-gray-900">
                  {dashboard?.payment_status_summary.failed ?? 0}
                </span>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Low seat alert">
          <p className="mb-4 text-sm text-gray-500">These cohorts are almost full.</p>
          {cohortsLoading ? (
            <ListRowSkeleton rows={3} />
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
