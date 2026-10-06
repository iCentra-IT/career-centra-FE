"use client";

import Link from "next/link";
import { useMyQuestionBanks } from "@/hooks/queries/question-banks";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState, HeroBanner } from "@/components/dashboard/dashboard-kit";
import { formatShortDate } from "@/lib/format";

// Banks this learner can open right now — granted by staff or bought as an add-on.
export function StudentQuestionBankList() {
  const { data: access, isLoading } = useMyQuestionBanks();
  const active = (access ?? []).filter((a) => a.has_access);

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow="Practice"
        title="Your question banks"
        subtitle="Practice sets you have access to. Each one has its own attempts and scores."
      />

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : active.length === 0 ? (
        <EmptyState>You don&apos;t have access to any question banks yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {active.map((a) => (
            <article key={a.id} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-sm font-semibold text-secondary">
                    {a.question_bank.question_count}
                  </span>
                  <StatusBadge label="Active" tone="green" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{a.question_bank.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{a.question_bank.description || "No description"}</p>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-400">
                  {a.expires_at ? `Access until ${formatShortDate(a.expires_at)}` : "Lifetime access"}
                </span>
                <Link
                  href={`/students/question-banks/${a.question_bank.id}`}
                  className="rounded-full bg-main px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue"
                >
                  Practice
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
