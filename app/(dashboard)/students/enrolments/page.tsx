"use client";

import Link from "next/link";
import { useStudentEnrollments } from "@/hooks/queries/students";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { displayTitle, formatDateRange, formatMoney } from "@/lib/format";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const MyEnrolmentsPage = () => {
  const { data, isLoading } = useStudentEnrollments();
  const enrolments = data?.results ?? [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">My enrollments</h1>
      <p className="mt-1 text-sm text-gray-500">Your enrolled certification programs.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Purchased courses" value={data?.stats.purchased} loading={isLoading} />
        <StatCard label="Active courses" value={data?.stats.active} loading={isLoading} />
        <StatCard label="Completed courses" value={data?.stats.completed} loading={isLoading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
        {!isLoading && enrolments.length === 0 && (
          <p className="text-sm text-gray-400">No enrollments yet.</p>
        )}
        {enrolments.map((enrolment) => (
          <div key={enrolment.id} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                {enrolment.program.program_type}
              </span>
              <StatusBadge
                label={enrolment.progress.completed_all ? "Completed" : "Active"}
                tone={enrolment.progress.completed_all ? "gray" : "green"}
              />
            </div>

            <h3 className="mt-3 text-lg font-semibold text-gray-900">
              {displayTitle(enrolment.program.title)}
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Cohort Dates</p>
                <p className="mt-1 font-medium text-gray-900">
                  {formatDateRange(enrolment.cohort.starts_on, enrolment.cohort.ends_on)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Facilitator</p>
                <p className="mt-1 font-medium text-gray-900">
                  {displayTitle(enrolment.cohort.facilitator)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Format</p>
                <p className="mt-1 font-medium text-gray-900">
                  {capitalize(enrolment.cohort.delivery_mode)}
                </p>
              </div>
              {enrolment.amount_paid && (
                <div>
                  <p className="text-xs text-gray-400">Amount paid</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatMoney(enrolment.amount_paid, enrolment.currency ?? "")}
                  </p>
                </div>
              )}
            </div>

            {enrolment.cohort.location && (
              <p className="mt-3 text-sm text-gray-500">Location: {enrolment.cohort.location}</p>
            )}

            <div className="mt-4 border-t border-gray-50 pt-4">
              <Link
                href="/students/schedules"
                className="inline-flex rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/20"
              >
                Class schedule
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEnrolmentsPage;
