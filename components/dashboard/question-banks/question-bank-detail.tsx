"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuestionBank, useAdminQuestions } from "@/hooks/queries/question-banks";
import {
  useDeleteAdminQuestion,
  useGrantQuestionBankAccess,
  usePatchAdminQuestion,
  useUploadQuestionBankCsv,
} from "@/hooks/mutations/question-banks";
import { useAdminLearners } from "@/hooks/queries/admin-learners";
import { QuestionBankModal } from "@/components/dashboard/question-banks/question-bank-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailPageSkeleton } from "@/components/ui/skeleton";
import { Card, EmptyState, MetricTile } from "@/components/dashboard/dashboard-kit";
import { ACCESS_DURATION_OPTIONS, type AdminQuestion, type AnswerLetter } from "@/types/question-bank";

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";
const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];

function CsvUploadCard({ bankId }: { bankId: number }) {
  const upload = useUploadQuestionBankCsv(bankId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const onUpload = () => {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: (res) => {
        toast.success(`${res.created} question${res.created === 1 ? "" : "s"} added.`);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Card title="Upload questions (CSV)">
      <p className="-mt-2 mb-4 text-xs text-gray-400">
        Each row is one question. New rows are added to the bank; existing questions aren&apos;t replaced.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
      />
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={onUpload} disabled={!file} loading={upload.isPending} className="w-auto px-5">
          Upload
        </Button>
      </div>
    </Card>
  );
}

function GrantAccessCard({ bankId }: { bankId: number }) {
  const { data: learners = [] } = useAdminLearners();
  const grant = useGrantQuestionBankAccess(bankId);
  const [userId, setUserId] = useState("");

  const onGrant = () => {
    if (!userId) return;
    grant.mutate(Number(userId), {
      onSuccess: () => {
        toast.success("Access granted.");
        setUserId("");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Card title="Grant access">
      <p className="-mt-2 mb-4 text-xs text-gray-400">
        Gives a learner access for the bank&apos;s access duration, without a purchase.
      </p>
      <div className="flex flex-col gap-3">
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className={selectClass}>
          <option value="">Choose a learner</option>
          {learners.map((l) => (
            <option key={l.id} value={l.id}>
              {l.full_name} · {l.email}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
          <Button type="button" onClick={onGrant} disabled={!userId} loading={grant.isPending} className="w-auto px-5">
            Grant access
          </Button>
        </div>
      </div>
    </Card>
  );
}

function QuestionEditorModal({
  bankId,
  question,
  onClose,
}: {
  bankId: number;
  question: AdminQuestion;
  onClose: () => void;
}) {
  const patch = usePatchAdminQuestion(bankId);
  const remove = useDeleteAdminQuestion(bankId);
  const [draft, setDraft] = useState({
    text: question.text,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_option: question.correct_option,
    is_active: question.is_active,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    patch.mutate(
      { id: question.id, payload: { ...draft, text: draft.text.trim() } },
      {
        onSuccess: () => {
          toast.success("Question updated.");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      <Modal open onClose={onClose} size="lg">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">Edit question</h2>
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Question</label>
              <textarea
                rows={2}
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LETTERS.map((letter) => {
                const key = `option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d";
                return (
                  <Input
                    key={letter}
                    label={`Option ${letter}`}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-900">Correct answer</label>
                <select
                  value={draft.correct_option}
                  onChange={(e) => setDraft({ ...draft, correct_option: e.target.value as AnswerLetter })}
                  className={selectClass}
                >
                  {LETTERS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <label className="mt-7 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-secondary"
                />
                Active
              </label>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-red-600 hover:underline">
              Delete question
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button type="button" onClick={save} loading={patch.isPending} className="w-auto px-5">
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <ConfirmDeleteModal
        open={confirmDelete}
        title="Delete question"
        description="This removes the question from the bank. Past attempts keep their recorded answers."
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(question.id, {
            onSuccess: () => {
              toast.success("Question deleted.");
              onClose();
            },
            onError: (err) => toast.error(err.message),
          })
        }
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}

// Every question in the bank with its answer key. Editing or removing one refreshes the list.
function QuestionsCard({ bankId }: { bankId: number }) {
  const { data: questions, isLoading, isError, error } = useAdminQuestions(bankId);
  const [editing, setEditing] = useState<AdminQuestion | null>(null);
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);
  const remove = useDeleteAdminQuestion(bankId);
  const [query, setQuery] = useState("");

  const visible = (questions ?? []).filter((q) => q.text.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Card title={`Questions${questions ? ` (${questions.length})` : ""}`}>
      <div className="-mt-2 mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-400">Shows the correct answer for every question. Learners never see it.</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions"
          className="w-60 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading questions…</p>}
      {isError && <p className="text-sm text-red-600">{error.message}</p>}
      {!isLoading && !isError && visible.length === 0 && (
        <EmptyState>{questions?.length ? "No questions match that search." : "No questions yet — upload a CSV above."}</EmptyState>
      )}

      {visible.length > 0 && (
        <ol className="divide-y divide-gray-100">
          {visible.map((q, i) => (
            <li key={q.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  <span className="mr-2 text-gray-400">{i + 1}.</span>
                  {q.text}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  A) {q.option_a} · B) {q.option_b} · C) {q.option_c} · D) {q.option_d}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Answer {q.correct_option}
                </span>
                <StatusBadge label={q.is_active ? "Active" : "Hidden"} tone={q.is_active ? "green" : "gray"} />
                <button type="button" onClick={() => setEditing(q)} className="text-sm text-gray-500 hover:text-gray-900">
                  Edit
                </button>
                <button type="button" onClick={() => setDeleting(q)} className="text-sm text-gray-500 hover:text-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing && <QuestionEditorModal bankId={bankId} question={editing} onClose={() => setEditing(null)} />}
      <ConfirmDeleteModal
        open={!!deleting}
        title="Delete question"
        description="This removes the question from the bank. Past attempts keep their recorded answers."
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Question deleted.");
              setDeleting(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
        onClose={() => setDeleting(null)}
      />
    </Card>
  );
}

export function QuestionBankDetailPage({ bankId }: { bankId: number }) {
  const { data: bank, isLoading, isError } = useQuestionBank(bankId);
  const [editing, setEditing] = useState(false);

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !bank) return <p className="text-sm text-gray-400">Question bank not found.</p>;

  const duration = ACCESS_DURATION_OPTIONS.find((o) => o.value === bank.access_duration)?.label ?? bank.access_duration;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/question-banks" className="text-sm text-gray-400 hover:text-gray-600">
          ← Question banks
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{bank.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{bank.description || "No description"}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit bank
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricTile label="Questions" value={bank.question_count} />
        <MetricTile label="Access" value={duration} />
        <MetricTile label="Status" value={bank.is_active ? "Active" : "Inactive"} tone={bank.is_active ? "good" : "warn"} />
        <MetricTile label="Bank ID" value={`#${bank.id}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CsvUploadCard bankId={bank.id} />
        <GrantAccessCard bankId={bank.id} />
      </div>
      <QuestionsCard bankId={bank.id} />

      {editing && <QuestionBankModal open onClose={() => setEditing(false)} bank={bank} />}
    </div>
  );
}
