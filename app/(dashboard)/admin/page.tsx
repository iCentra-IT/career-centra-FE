"use client";

import { useCohorts } from "@/hooks/queries/cohort";
import { useAdminDashboard } from "@/hooks/queries/admin-dashboard";
import { useAuthStore } from "@/lib/store/authStore";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { formatMoney, formatUsd } from "@/lib/format";
import { Card, EmptyState, HeroBanner, HeroButton, greetingFor } from "@/components/dashboard/dashboard-kit";

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  const s = status.toLowerCase();
  if (s === "successful" || s === "confirmed" || s === "completed" || s === "approved") return "green";
  if (s === "pending" || s === "submitted" || s === "under_review") return "yellow";
  if (s === "failed" || s === "cancelled" || s === "rejected") return "red";
  return "gray";
}

const AdminOverviewPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts();

  const nearlyFullCohorts = cohorts?.results?.filter((c) => c.is_nearly_full) ?? [];
  const recentEnrollments = (dashboard?.recent_enrollments ?? []).slice(0, 5);
  const recentFacilitators = (dashboard?.recent_facilitators ?? []).slice(0, 5);
  const payments = dashboard?.payment_status_summary;

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow={`${greetingFor()}${user?.first_name ? `, ${user.first_name}` : ""}`}
        title="Platform overview"
        subtitle="Revenue, enrolments and cohort capacity across CareerCentra."
      >
        <HeroButton href="/admin/programs/create" primary>
          + New Program
        </HeroButton>
        <HeroButton href="/admin/cohorts/create">New Cohort</HeroButton>
      </HeroBanner>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total programs" value={dashboard?.overview.total_programs} loading={dashboardLoading} />
        <StatCard
          label="Revenue (NGN)"
          value={dashboard ? formatMoney(dashboard.overview.total_revenue_ngn, "NGN") : undefined}
          loading={dashboardLoading}
        />
        <StatCard
          label="Revenue (USD)"
          value={dashboard ? formatUsd(dashboard.overview.total_revenue_usd) : undefined}
          loading={dashboardLoading}
        />
        <StatCard label="Active cohorts" value={dashboard?.overview.active_cohorts} loading={dashboardLoading} />
        <StatCard label="Total enrolments" value={dashboard?.overview.total_enrollments} loading={dashboardLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Recent enrolments" action={{ label: "All enrolments", href: "/admin/enrollments" }} className="xl:col-span-2">
          {dashboardLoading ? (
            <ListRowSkeleton rows={4} />
          ) : recentEnrollments.length === 0 ? (
            <EmptyState>No enrolments yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentEnrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{e.learner_name}</p>
                    <p className="truncate text-xs text-gray-400">{e.program_title}</p>
                  </div>
                  <StatusBadge label={e.status} tone={statusTone(e.status)} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Payments">
          {dashboardLoading ? (
            <ListRowSkeleton rows={3} />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-xl font-semibold text-green-700">{payments?.confirmed ?? 0}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-green-700/70">Confirmed</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-xl font-semibold text-amber-700">{payments?.pending ?? 0}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700/70">Pending</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-xl font-semibold text-red-600">{payments?.failed ?? 0}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-red-600/70">Failed</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Recent facilitators" action={{ label: "All facilitators", href: "/admin/facilitators" }}>
          {dashboardLoading ? (
            <ListRowSkeleton rows={4} />
          ) : recentFacilitators.length === 0 ? (
            <EmptyState>No facilitators yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentFacilitators.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{f.full_name}</p>
                    <p className="truncate text-xs text-gray-400">{f.domains.join(", ")}</p>
                  </div>
                  <StatusBadge label={f.is_published ? "Published" : "Unpublished"} tone={f.is_published ? "green" : "gray"} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Low seat alert" className="xl:col-span-2">
          <p className="-mt-2 mb-4 text-sm text-gray-500">Cohorts that are almost full.</p>
          {cohortsLoading ? (
            <ListRowSkeleton rows={3} />
          ) : nearlyFullCohorts.length ? (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {nearlyFullCohorts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
                  <span className="truncate text-sm font-medium text-gray-900">{c.program.title}</span>
                  <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    {c.seats_remaining} of {c.seat_capacity} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No cohorts are close to full right now.</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
