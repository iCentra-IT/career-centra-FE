"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { FacilitatorSessionCard } from "@/components/dashboard/facilitator-session-card";
import {
  FACILITATOR_STATS,
  FACILITATOR_UPCOMING_SESSIONS,
  FACILITATOR_RECENT_UPDATES,
} from "@/lib/facilitator-placeholder";

function OverviewStat({
  label,
  value,
  deltaLabel,
}: {
  label: string;
  value: number;
  deltaLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-gray-900">{value}</p>
      <div className="mt-4 flex items-center gap-2">
        {/* TODO(api): real period-over-period delta once an overview endpoint exists */}
        <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-500">
          {deltaLabel}
        </span>
        <span className="text-xs text-gray-400">Vs Last Month</span>
      </div>
    </div>
  );
}

const FacilitatorDashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">
        Welcome{user?.first_name ? `, ${user.first_name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Your facilitation overview.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACILITATOR_STATS.map((stat) => (
          <OverviewStat
            key={stat.key}
            label={stat.label}
            value={stat.value}
            deltaLabel={stat.deltaLabel}
          />
        ))}
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
            {FACILITATOR_UPCOMING_SESSIONS.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming sessions.</p>
            ) : (
              FACILITATOR_UPCOMING_SESSIONS.map((session) => (
                <FacilitatorSessionCard key={session.id} session={session} />
              ))
            )}
          </div>
        </section>

        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Recent updates</h2>
          <div className="mt-2 flex flex-col divide-y divide-gray-100">
            {FACILITATOR_RECENT_UPDATES.length === 0 ? (
              <p className="py-4 text-sm text-gray-400">No updates yet.</p>
            ) : (
              FACILITATOR_RECENT_UPDATES.map((update) => (
                <div key={update.id} className="py-4 first:pt-2 last:pb-1">
                  <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    {update.kind}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{update.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{update.body}</p>
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
