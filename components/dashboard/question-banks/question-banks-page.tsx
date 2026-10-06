"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuestionBanks } from "@/hooks/queries/question-banks";
import { useDeleteQuestionBank, usePatchQuestionBank } from "@/hooks/mutations/question-banks";
import { QuestionBankModal } from "@/components/dashboard/question-banks/question-bank-form";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState, HeroBanner } from "@/components/dashboard/dashboard-kit";
import { ACCESS_DURATION_OPTIONS, type QuestionBank } from "@/types/question-bank";
import { formatShortDate } from "@/lib/format";

function accessLabel(value: QuestionBank["access_duration"]) {
  return ACCESS_DURATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function BankCard({
  bank,
  onEdit,
  onDelete,
}: {
  bank: QuestionBank;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const toggle = usePatchQuestionBank(bank.id);
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-sm font-semibold text-secondary">
            {bank.question_count}
          </span>
          <StatusBadge label={bank.is_active ? "Active" : "Inactive"} tone={bank.is_active ? "green" : "gray"} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">{bank.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{bank.description || "No description"}</p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Access: {accessLabel(bank.access_duration)}</span>
          <span>Updated {formatShortDate(bank.updated_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/question-banks/${bank.id}`}
            className="flex-1 rounded-full bg-main px-4 py-2 text-center text-sm font-medium text-white hover:bg-deep-blue"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={toggle.isPending}
            onClick={() =>
              toggle.mutate({ is_active: !bank.is_active }, { onError: (err) => toast.error(err.message) })
            }
            className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {bank.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export function QuestionBanksPage() {
  const { data: banks, isLoading } = useQuestionBanks();
  const deleteBank = useDeleteQuestionBank();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<QuestionBank | null>(null);
  const [deleting, setDeleting] = useState<QuestionBank | null>(null);

  const total = banks?.reduce((sum, b) => sum + b.question_count, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow="Learning tools"
        title="Question banks"
        subtitle="Practice question sets learners can buy or be granted. Upload questions as CSV, set how long access lasts, and track attempts."
      >
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full bg-glass px-4 py-2 text-sm font-medium text-deep-blue hover:opacity-90"
        >
          + New bank
        </button>
      </HeroBanner>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Banks</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{banks?.length ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Questions</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{banks ? total : "—"}</p>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : !banks?.length ? (
        <EmptyState>No question banks yet. Create one, then upload its questions as a CSV.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {banks.map((bank) => (
            <BankCard key={bank.id} bank={bank} onEdit={() => setEditing(bank)} onDelete={() => setDeleting(bank)} />
          ))}
        </div>
      )}

      <QuestionBankModal open={creating} onClose={() => setCreating(false)} />
      {editing && <QuestionBankModal open onClose={() => setEditing(null)} bank={editing} />}
      <ConfirmDeleteModal
        open={!!deleting}
        title="Delete question bank"
        description={`Delete "${deleting?.name}" and its ${deleting?.question_count ?? 0} questions? Learners lose access to it.`}
        loading={deleteBank.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteBank.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Question bank deleted.");
              setDeleting(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
