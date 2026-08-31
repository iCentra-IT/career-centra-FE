"use client";

import { usePrograms } from "@/hooks/queries/programs";
import { useCohorts } from "@/hooks/queries/cohort";
import { useAdminEnrollments } from "@/hooks/queries/admin-enrollments";
import { useFacilitatorApplications } from "@/hooks/queries/facilitator-applications";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyTableState } from "@/components/ui/empty-table";
import { ListRowSkeleton } from "@/components/ui/skeleton";

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
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts();
  const { data: enrollments, isLoading: enrollmentsLoading } = useAdminEnrollments();
  const { data: applications, isLoading: applicationsLoading } = useFacilitatorApplications();

  const activeCohorts = cohorts?.results?.filter((c) => c.is_active && !c.is_sold_out) ?? [];
  const nearlyFullCohorts = cohorts?.results?.filter((c) => c.is_nearly_full) ?? [];
  const recentEnrollments = (enrollments?.results ?? []).slice(0, 5);
  const recentApplications = (applications ?? []).slice(0, 5);

  const successful = (enrollments?.results ?? []).filter((e) => statusTone(e.status) === "green").length;
  const pending = (enrollments?.results ?? []).filter((e) => statusTone(e.status) === "yellow").length;
  const failed = (enrollments?.results ?? []).filter((e) => statusTone(e.status) === "red").length;

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
        <StatCard label="Total enrollments" value={enrollments?.count} loading={enrollmentsLoading} />
        <StatCard label="Recent payments" note="No payments endpoint yet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Recent enrollments">
          {enrollmentsLoading ? (
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
        <Panel title="Recent facilitator applications">
          {applicationsLoading ? (
            <ListRowSkeleton rows={4} />
          ) : recentApplications.length === 0 ? (
            <EmptyTableState
              columns={["Applicant", "Domains", "Status"]}
              message="No facilitator applications yet."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentApplications.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{a.full_name}</p>
                    <p className="truncate text-xs text-gray-400">{a.domain_areas}</p>
                  </div>
                  <StatusBadge label={a.status_display} tone={statusTone(a.status)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Payment status summary">
          {enrollmentsLoading ? (
            <ListRowSkeleton rows={3} />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <StatusBadge label="Successful" tone="green" />
                <span className="font-medium text-gray-900">{successful}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <StatusBadge label="Pending" tone="yellow" />
                <span className="font-medium text-gray-900">{pending}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <StatusBadge label="Failed" tone="red" />
                <span className="font-medium text-gray-900">{failed}</span>
              </div>
              <p className="text-xs text-gray-400">From the most recently loaded page, not a lifetime total.</p>
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
