"use client";

import { useState } from "react";
import { useStudentSchedule } from "@/hooks/queries/students";
import { RowCardSkeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/format";
import type { ScheduleItem } from "@/types/student";

function VideoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 5.5l3.5-2v7l-3.5-2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1.5 5.2a9 9 0 0111 0M3.5 7.6a6 6 0 017 0M5.7 10a3 3 0 012.6 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 12.5s4.5-3.9 4.5-7A4.5 4.5 0 002.5 5.5c0 3.1 4.5 7 4.5 7z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function deliveryModeBadge(mode: string) {
  const m = mode.toLowerCase();
  if (m === "online") return { label: "Online", classes: "bg-green-50 text-green-700", icon: <VideoIcon /> };
  if (m === "hybrid") return { label: "Hybrid", classes: "bg-blue-50 text-blue-600", icon: <WifiIcon /> };
  if (m === "in_person") return { label: "In Person", classes: "bg-purple-50 text-purple-700", icon: <PinIcon /> };
  return { label: mode, classes: "bg-gray-100 text-gray-600", icon: null };
}

function CohortScheduleBlock({ item }: { item: ScheduleItem }) {
  const [expanded, setExpanded] = useState(false);
  const sessions = item.sessions;
  const visibleSessions = expanded ? sessions : sessions.slice(0, 3);
  const mode = deliveryModeBadge(item.cohort.delivery_mode);
  const isCompleted = item.progress.completed_all;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{item.program.title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {formatDateRange(item.cohort.starts_on, item.cohort.ends_on)} · {item.cohort.facilitator_name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${mode.classes}`}
          >
            {mode.icon}
            {mode.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isCompleted ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? "bg-gray-400" : "bg-green-500"}`} />
            {isCompleted ? "Completed" : "Active"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-900">Ongoing Class</p>
        {sessions.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-secondary hover:underline"
          >
            {expanded ? "View less" : "View all"}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {visibleSessions.length === 0 && (
          <p className="text-sm text-gray-400">No sessions scheduled yet.</p>
        )}
        {visibleSessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{session.title}</p>
              <p className="mt-1 truncate text-xs text-gray-500">
                {session.program_title} · {session.date} · {session.start_time}-{session.end_time} WAT
              </p>
            </div>
            {session.meeting_url ? (
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-main px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue"
              >
                <VideoIcon />
                Join
              </a>
            ) : (
              <span className="shrink-0 text-xs text-gray-400">Link not available</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const SchedulesPage = () => {
  const { data, isLoading } = useStudentSchedule();
  const schedule = data?.schedule ?? [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Class schedule</h1>
      <p className="mt-1 text-sm text-gray-500">Your weekly classes, formats and join links.</p>

      <div className="mt-6 flex flex-col gap-6">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => <RowCardSkeleton key={i} />)}
        {!isLoading && schedule.length === 0 && (
          <p className="text-sm text-gray-400">No classes scheduled yet.</p>
        )}
        {schedule.map((item) => (
          <CohortScheduleBlock key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SchedulesPage;
