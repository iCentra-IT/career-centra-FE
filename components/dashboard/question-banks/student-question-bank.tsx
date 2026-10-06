"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAttempt, useMyAttempts } from "@/hooks/queries/question-banks";
import { useStartAttempt, useSubmitAttempt } from "@/hooks/mutations/question-banks";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailPageSkeleton, ListRowSkeleton } from "@/components/ui/skeleton";
import { Card, EmptyState, HeroBanner, MetricTile } from "@/components/dashboard/dashboard-kit";
import { formatOrdinalDateTime } from "@/lib/format";
import type { AnswerLetter, AttemptQuestion, QuestionBankAttempt } from "@/types/question-bank";

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];
const LIMIT_OPTIONS = [5, 10, 20, 30];

// The bank page: past attempts plus "start a new one". Starting drops the learner straight into it.
export function StudentQuestionBankPage({ bankId }: { bankId: number }) {
  const router = useRouter();
  const { data: attempts, isLoading } = useMyAttempts(bankId);
  const start = useStartAttempt(bankId);
  const [limit, setLimit] = useState(10);

  const onStart = () =>
    start.mutate(
      { limit },
      {
        onSuccess: (attempt) => router.push(`/students/question-banks/attempts/${attempt.id}`),
        onError: (err) => toast.error(err.message),
      },
    );

  const sorted = [...(attempts ?? [])].sort((a, b) => b.id - a.id);
  const best = sorted.reduce<number | null>((max, a) => {
    const s = a.score_percent == null ? null : parseFloat(a.score_percent);
    return s == null ? max : max == null ? s : Math.max(max, s);
  }, null);

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow="Practice"
        title="Question bank"
        subtitle="Work through a random set of questions, then see exactly what you got right and why."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricTile label="Attempts" value={attempts?.length ?? 0} />
        <MetricTile label="Best score" value={best == null ? "—" : `${best.toFixed(0)}%`} tone="good" />
        <MetricTile label="In progress" value={sorted.filter((a) => a.status === "in_progress").length} />
        <MetricTile label="Questions per set" value={limit} />
      </div>

      <Card title="Start a new attempt">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">How many questions?</label>
            <div className="flex gap-2">
              {LIMIT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLimit(n)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    limit === n ? "bg-main text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" onClick={onStart} loading={start.isPending} className="w-auto px-6">
            Start attempt
          </Button>
        </div>
      </Card>

      <Card title="Your attempts">
        {isLoading ? (
          <ListRowSkeleton rows={3} />
        ) : sorted.length === 0 ? (
          <EmptyState>You haven&apos;t tried this question bank yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sorted.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {a.status === "submitted" ? `Scored ${a.correct_answers}/${a.total_questions}` : "Unfinished attempt"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Started {formatOrdinalDateTime(a.started_at)}
                    {a.submitted_at ? ` · submitted ${formatOrdinalDateTime(a.submitted_at)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {a.status === "submitted" && a.score_percent != null && (
                    <span className="text-lg font-semibold text-gray-900">{parseFloat(a.score_percent).toFixed(0)}%</span>
                  )}
                  <StatusBadge
                    label={a.status === "submitted" ? "Submitted" : "In progress"}
                    tone={a.status === "submitted" ? "green" : "yellow"}
                  />
                  <Link
                    href={`/students/question-banks/attempts/${a.id}`}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {a.status === "submitted" ? "Review" : "Continue"}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function QuestionOptions({
  question,
  selected,
  onSelect,
  disabled,
}: {
  question: AttemptQuestion;
  selected?: AnswerLetter;
  onSelect?: (letter: AnswerLetter) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {LETTERS.map((letter) => {
        const active = selected === letter;
        return (
          <li key={letter}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(letter)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${
                active ? "border-secondary bg-secondary/5 text-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-300"
              } disabled:cursor-default`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active ? "bg-secondary text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {letter}
              </span>
              <span>{question.options[letter]}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function QuizView({ attempt }: { attempt: QuestionBankAttempt }) {
  const submit = useSubmitAttempt(attempt.id, attempt.question_bank);
  const [answers, setAnswers] = useState<Record<number, AnswerLetter>>({});
  const [confirming, setConfirming] = useState(false);
  const questions = attempt.questions ?? [];
  const answeredCount = Object.keys(answers).length;

  const doSubmit = () =>
    submit.mutate(
      {
        answers: Object.entries(answers).map(([qid, answer]) => ({ question_id: Number(qid), answer })),
      },
      { onError: (err) => toast.error(err.message) },
    );

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow={`Attempt #${attempt.id}`}
        title={`${questions.length} questions`}
        subtitle={`${answeredCount} of ${questions.length} answered. Pick one option per question, then submit.`}
      >
        <Button type="button" onClick={() => setConfirming(true)} loading={submit.isPending} className="w-auto px-5">
          Submit answers
        </Button>
      </HeroBanner>

      <ol className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-900">
              <span className="mr-2 text-gray-400">{i + 1}.</span>
              {q.text}
            </p>
            <QuestionOptions
              question={q}
              selected={answers[q.id]}
              onSelect={(letter) => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
              disabled={submit.isPending}
            />
          </li>
        ))}
      </ol>

      <ConfirmDeleteModal
        open={confirming}
        title="Submit your answers?"
        description={
          answeredCount < questions.length
            ? `${questions.length - answeredCount} question(s) are still unanswered. Unanswered questions score as wrong.`
            : "You can review your score and every answer right after submitting."
        }
        confirmLabel="Submit"
        loading={submit.isPending}
        onConfirm={() => {
          setConfirming(false);
          doSubmit();
        }}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}

function ResultView({ attempt }: { attempt: QuestionBankAttempt }) {
  const questions = attempt.questions ?? [];
  const byQuestion = new Map((attempt.answers ?? []).map((a) => [a.question, a]));
  const score = attempt.score_percent == null ? null : parseFloat(attempt.score_percent);

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow={`Attempt #${attempt.id}`}
        title={score == null ? "Results" : `You scored ${score.toFixed(0)}%`}
        subtitle={`${attempt.correct_answers} of ${attempt.total_questions} correct · submitted ${
          attempt.submitted_at ? formatOrdinalDateTime(attempt.submitted_at) : ""
        }`}
      >
        <Link href={`/students/question-banks/${attempt.question_bank}`} className="rounded-full bg-glass px-4 py-2 text-sm font-medium text-deep-blue hover:opacity-90">
          Back to question bank
        </Link>
      </HeroBanner>

      <ol className="flex flex-col gap-4">
        {questions.map((q, i) => {
          const result = byQuestion.get(q.id);
          const correct = result?.is_correct ?? false;
          return (
            <li key={q.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">
                  <span className="mr-2 text-gray-400">{i + 1}.</span>
                  {q.text}
                </p>
                <StatusBadge label={result ? (correct ? "Correct" : "Incorrect") : "Unanswered"} tone={correct ? "green" : result ? "red" : "gray"} />
              </div>
              <QuestionOptions question={q} selected={result?.selected_option ?? undefined} disabled />
              {result && !correct && (
                <p className="mt-3 text-xs text-gray-500">
                  Correct answer: <span className="font-semibold text-green-700">{result.correct_option}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// The attempt page: answer the questions if it's still open, otherwise show the scored review.
export function StudentAttemptPage({ attemptId }: { attemptId: number }) {
  const { data: attempt, isLoading, isError, error } = useAttempt(attemptId);

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !attempt) return <p className="text-sm text-red-600">{error?.message ?? "Attempt not found."}</p>;

  if (attempt.status === "submitted") return <ResultView attempt={attempt} />;
  return <QuizView key={attempt.id} attempt={attempt} />;
}
