"use client";

import { useStudentDashboard } from "@/hooks/queries/students";
import { useAuthStore } from "@/lib/store/authStore";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { formatDateRange, hasSessionEnded } from "@/lib/format";
import { Card, EmptyState, HeroBanner, HeroButton, greetingFor } from "@/components/dashboard/dashboard-kit";

function JoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 5.5l3.5-2v7l-3.5-2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

const StudentOverviewPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useStudentDashboard();
  const active = data?.active_courses ?? [];
  const upcoming = data?.upcoming_sessions ?? [];
  const completed = data?.completed_courses ?? [];
  const updates = data?.class_updates ?? [];

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow={`${greetingFor()}${user?.first_name ? `, ${user.first_name}` : ""}`}
        title="Your learning, at a glance"
        subtitle="Pick up where you left off — your courses, sessions and certificates are all here."
      >
        <HeroButton href="/students/enrolments" primary>
          My Courses
        </HeroButton>
        <HeroButton href="/students/schedules">Class Schedule</HeroButton>
      </HeroBanner>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Purchased courses" value={data?.stats?.purchased} loading={isLoading} />
        <StatCard label="Active courses" value={data?.stats?.active} loading={isLoading} />
        <StatCard label="Completed courses" value={data?.stats?.completed} loading={isLoading} />
        <StatCard label="Certificates" value={data?.stats?.certificates} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card title="Active courses & progress" action={{ label: "View all", href: "/students/courses" }}>
            <div className="flex flex-col gap-4">
              {isLoading && <ListRowSkeleton rows={3} />}
              {!isLoading && active.length === 0 && <EmptyState>No active courses yet.</EmptyState>}
              {active.map((course) => (
                <div key={course.id} className="rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-900">{course.program.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDateRange(course.cohort.starts_on, course.cohort.ends_on)} · {course.cohort.facilitator_name}
                      </p>
                    </div>
                    <StatusBadge label="Active" tone="green" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar percent={course.progress.percent} />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{course.progress.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming sessions" action={{ label: "Schedule", href: "/students/schedules" }}>
            <div className="flex flex-col gap-3">
              {isLoading && <ListRowSkeleton rows={3} />}
              {!isLoading && upcoming.length === 0 && <EmptyState>No upcoming sessions.</EmptyState>}
              {upcoming.map((session) => {
                const ended = hasSessionEnded(session.date, session.end_time);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{session.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {session.program_title} · {session.date} · {session.start_time}–{session.end_time}
                      </p>
                    </div>
                    {session.meeting_url && !ended ? (
                      <a
                        href={session.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-2 rounded-full bg-main px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue"
                      >
                        <JoinIcon />
                        Join
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-gray-400">
                        {ended ? "Session ended" : "Link not available"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Completed courses" action={{ label: "View all", href: "/students/enrolments" }}>
            <div className="flex flex-col gap-3">
              {isLoading && <ListRowSkeleton rows={3} />}
              {!isLoading && completed.length === 0 && <EmptyState>No completed courses yet.</EmptyState>}
              {completed.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{course.program.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDateRange(course.cohort.starts_on, course.cohort.ends_on)}</p>
                  </div>
                  {course.certificate?.file_url ? (
                    <a
                      href={course.certificate.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                    >
                      View certificate
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-400">No certificate yet</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Class updates">
          {isLoading && <ListRowSkeleton rows={3} />}
          {!isLoading && updates.length === 0 && <EmptyState>No updates yet.</EmptyState>}
          <ul className="divide-y divide-gray-100">
            {updates.map((update) => (
              <li key={update.id} className="py-4 first:pt-0 last:pb-0">
                <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium capitalize text-secondary">
                  {update.kind}
                </span>
                <p className="mt-2 text-sm font-medium text-gray-900">{update.body}</p>
                <p className="mt-1 text-xs text-gray-500">{update.program_title}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default StudentOverviewPage;
