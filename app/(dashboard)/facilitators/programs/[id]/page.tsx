"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useFacilitatorProgramDetail } from "@/hooks/queries/facilitator-dashboard";
import { FacilitatorSessionCard } from "@/components/dashboard/facilitator-session-card";
import { formatShortDate } from "@/lib/format";
import { DetailPageSkeleton } from "@/components/ui/skeleton";

function VideoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="8.5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.2l4-2.2v8l-4-2.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

const FacilitatorClassDetailPage = () => {
  const params = useParams<{ id: string }>();
  const cohortId = Number(params.id);
  const { data: detail, isLoading } = useFacilitatorProgramDetail(cohortId);

  if (isLoading) return <DetailPageSkeleton />;
  if (!detail) {
    return <div className="px-6 py-20 text-center text-sm text-gray-400">Class not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">My programs</h1>
      <p className="mt-1 text-sm text-gray-500">Programs you are assigned to facilitate.</p>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">{detail.program_title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {formatShortDate(detail.starts_on)} → {formatShortDate(detail.ends_on)} ·{" "}
              {detail.facilitator_display}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <VideoIcon />
              {detail.delivery_mode_display}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {detail.status}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Ongoing Class</h3>
            <Link
              href="/facilitators/programs"
              className="text-sm font-medium text-gray-900 underline hover:text-main"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {detail.upcoming_sessions.length === 0 ? (
              <p className="text-sm text-gray-400">No classes scheduled yet.</p>
            ) : (
              detail.upcoming_sessions.map((session) => (
                <FacilitatorSessionCard key={session.id} session={session} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorClassDetailPage;
