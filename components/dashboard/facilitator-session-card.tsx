import type { FacilitatorSessionSummary } from "@/types/facilitator";
import { formatShortDate, formatTimeOfDay } from "@/lib/format";

function JoinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="8.5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.2l4-2.2v8l-4-2.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function FacilitatorSessionCard({ session }: { session: FacilitatorSessionSummary }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-gray-900">{session.title}</p>
        <p className="mt-1 truncate text-sm text-gray-500">
          {session.program_title} · {formatShortDate(session.date)} ·{" "}
          {formatTimeOfDay(session.start_time)}–{formatTimeOfDay(session.end_time)}
        </p>
      </div>
      {session.meeting_url ? (
        <a
          href={session.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-2 rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          <JoinIcon />
          Join
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Meeting link not available yet"
          className="flex shrink-0 items-center gap-2 rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white opacity-60"
        >
          <JoinIcon />
          Join
        </button>
      )}
    </div>
  );
}
