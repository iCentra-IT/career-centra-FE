"use client";

import Link from "next/link";
import { useStudentDashboard } from "@/hooks/queries/students";
import { useAuthStore } from "@/lib/store/authStore";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/format";

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

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">
        Welcome back{user?.first_name ? `, ${user.first_name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Your learning account at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Purchased courses" value={data?.stats?.purchased} loading={isLoading} />
        <StatCard label="Active courses" value={data?.stats?.active} loading={isLoading} />
        <StatCard label="Completed courses" value={data?.stats?.completed} loading={isLoading} />
        <StatCard label="Certificates" value={data?.stats?.certificates} loading={isLoading} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Active courses &amp; progress</h2>
              <Link href="/students/enrolments" className="text-sm text-secondary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {isLoading && <ListRowSkeleton rows={3} />}
              {!isLoading && data?.active_courses?.length === 0 && (
                <p className="text-sm text-gray-400">No active courses yet.</p>
              )}
              {data?.active_courses?.map((course) => (
                <div key={course.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-gray-900">{course.program.title}</h3>
                    <StatusBadge label="Active" tone="green" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDateRange(course.cohort.starts_on, course.cohort.ends_on)} ·{" "}
                    {course.cohort.facilitator_name}
                  </p>
                  <p className="mt-4 text-xs text-gray-400">Progress</p>
                  <ProgressBar percent={course.progress.percent} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Sessions</h2>
              <Link href="/students/schedules" className="text-sm text-secondary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {isLoading && <ListRowSkeleton rows={3} />}
              {!isLoading && data?.upcoming_sessions?.length === 0 && (
                <p className="text-sm text-gray-400">No upcoming sessions.</p>
              )}
              {data?.upcoming_sessions?.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{session.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {session.program_title} · {session.date} · {session.start_time}-{session.end_time}
                    </p>
                  </div>
                  {session.meeting_url ? (
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
                    <span className="shrink-0 text-xs text-gray-400">Link not available</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Completed Courses</h2>
              <Link href="/students/enrolments" className="text-sm text-secondary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {isLoading && <ListRowSkeleton rows={3} />}
              {!isLoading && data?.completed_courses?.length === 0 && (
                <p className="text-sm text-gray-400">No completed courses yet.</p>
              )}
              {data?.completed_courses?.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{course.program.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDateRange(course.cohort.starts_on, course.cohort.ends_on)}
                    </p>
                  </div>
                  {course.certificate?.file_url ? (
                    <a
                      href={course.certificate.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                    >
                      View Certificate
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-400">No certificate yet</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Class updates</h2>
          <div className="mt-4 flex flex-col divide-y divide-gray-50">
            {isLoading && <ListRowSkeleton rows={3} />}
            {!isLoading && data?.class_updates?.length === 0 && (
              <p className="py-3 text-sm text-gray-400">No updates yet.</p>
            )}
            {data?.class_updates?.map((update) => (
              <div key={update.id} className="py-4 first:pt-0 last:pb-0">
                <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium capitalize text-secondary">
                  {update.kind}
                </span>
                <p className="mt-2 text-sm font-medium text-gray-900">{update.body}</p>
                <p className="mt-1 text-xs text-gray-500">{update.program_title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewPage;
