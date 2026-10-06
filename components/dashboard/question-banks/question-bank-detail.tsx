"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuestionBank, useAdminQuestion } from "@/hooks/queries/question-banks";
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
import { Card, MetricTile } from "@/components/dashboard/dashboard-kit";
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

function QuestionEditorModal({ question, onClose }: { question: AdminQuestion; onClose: () => void }) {
  const patch = usePatchAdminQuestion();
  const remove = useDeleteAdminQuestion();
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
          <h2 className="text-lg font-semibold text-gray-900">Question #{question.id}</h2>
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

// The API has no list-questions endpoint yet, so questions are opened by id here.
function QuestionLookupCard() {
  const [input, setInput] = useState("");
  const [id, setId] = useState<number | null>(null);
  const { data: question, isFetching, isError, error } = useAdminQuestion(id);
  const [editing, setEditing] = useState(false);

  return (
    <Card title="Edit a question">
      <p className="-mt-2 mb-4 text-xs text-gray-400">Open a question by its ID to review, edit or remove it.</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && input && setId(Number(input))}
          placeholder="Question ID"
          className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <Button type="button" onClick={() => input && setId(Number(input))} disabled={!input} className="w-auto px-4">
          Open
        </Button>
      </div>

      {isFetching && <p className="mt-4 text-sm text-gray-400">Loading…</p>}
      {isError && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
      {question && !isFetching && (
        <div className="mt-4 rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">{question.text}</p>
            <StatusBadge label={question.is_active ? "Active" : "Hidden"} tone={question.is_active ? "green" : "gray"} />
          </div>
          <p className="mt-2 text-xs text-gray-500">Correct answer: {question.correct_option}</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-3 text-sm font-medium text-secondary hover:underline"
          >
            Edit question
          </button>
        </div>
      )}
      {editing && question && <QuestionEditorModal question={question} onClose={() => setEditing(false)} />}
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
        <QuestionLookupCard />
      </div>

      {editing && <QuestionBankModal open onClose={() => setEditing(false)} bank={bank} />}
    </div>
  );
}
