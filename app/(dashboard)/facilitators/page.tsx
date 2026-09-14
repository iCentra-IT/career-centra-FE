"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useFacilitatorDashboard } from "@/hooks/queries/facilitator-dashboard";
import { FacilitatorSessionCard } from "@/components/dashboard/facilitator-session-card";
import { formatOrdinalDateTime } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";

const FacilitatorDashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading } = useFacilitatorDashboard();

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">
        Welcome{user?.first_name ? `, ${user.first_name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Your facilitation overview.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Programs" value={dashboard?.stats.assigned_programs ?? 0} loading={isLoading} />
        <StatCard label="Upcoming Cohorts" value={dashboard?.stats.upcoming_cohorts ?? 0} loading={isLoading} />
        <StatCard label="Total Learners" value={dashboard?.stats.total_learners ?? 0} loading={isLoading} />
        <StatCard label="Sessions This Week" value={dashboard?.stats.sessions_this_week ?? 0} loading={isLoading} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link
              href="/facilitators/programs"
              className="text-sm font-medium text-gray-900 underline hover:text-main"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (dashboard?.upcoming_sessions ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming sessions.</p>
            ) : (
              dashboard?.upcoming_sessions.map((session) => (
                <FacilitatorSessionCard key={session.id} session={session} />
              ))
            )}
          </div>
        </section>

        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Recent updates</h2>
          <div className="mt-2 flex flex-col divide-y divide-gray-100">
            {isLoading ? (
              <p className="py-4 text-sm text-gray-400">Loading…</p>
            ) : (dashboard?.recent_updates ?? []).length === 0 ? (
              <p className="py-4 text-sm text-gray-400">No updates yet.</p>
            ) : (
              dashboard?.recent_updates.map((update) => (
                <div key={update.id} className="py-4 first:pt-2 last:pb-1">
                  <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    {update.notification_type_display}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{update.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{update.body}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatOrdinalDateTime(update.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorDashboardPage;
