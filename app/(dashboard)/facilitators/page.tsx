"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { useFacilitatorDashboard } from "@/hooks/queries/facilitator-dashboard";
import { FacilitatorSessionCard } from "@/components/dashboard/facilitator-session-card";
import { formatOrdinalDateTime } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";
import { Card, EmptyState, HeroBanner, HeroButton, greetingFor } from "@/components/dashboard/dashboard-kit";

const FacilitatorDashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading } = useFacilitatorDashboard();
  const sessions = dashboard?.upcoming_sessions ?? [];
  const updates = dashboard?.recent_updates ?? [];

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow={`${greetingFor()}${user?.first_name ? `, ${user.first_name}` : ""}`}
        title="Your facilitation overview"
        subtitle="Your programs, upcoming sessions and learners in one place."
      >
        <HeroButton href="/facilitators/programs" primary>
          My Programs
        </HeroButton>
        <HeroButton href="/facilitators/settings/profile">Edit Profile</HeroButton>
      </HeroBanner>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned programs" value={dashboard?.stats.assigned_programs ?? 0} loading={isLoading} />
        <StatCard label="Upcoming cohorts" value={dashboard?.stats.upcoming_cohorts ?? 0} loading={isLoading} />
        <StatCard label="Total learners" value={dashboard?.stats.total_learners ?? 0} loading={isLoading} />
        <StatCard label="Sessions this week" value={dashboard?.stats.sessions_this_week ?? 0} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Upcoming sessions" action={{ label: "View all", href: "/facilitators/programs" }} className="xl:col-span-2">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : sessions.length === 0 ? (
              <EmptyState>No upcoming sessions.</EmptyState>
            ) : (
              sessions.map((session) => <FacilitatorSessionCard key={session.id} session={session} />)
            )}
          </div>
        </Card>

        <Card title="Recent updates">
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : updates.length === 0 ? (
            <EmptyState>No updates yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-100">
              {updates.map((update) => (
                <li key={update.id} className="py-4 first:pt-0 last:pb-0">
                  <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    {update.notification_type_display}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{update.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{update.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatOrdinalDateTime(update.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FacilitatorDashboardPage;
