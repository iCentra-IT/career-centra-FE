"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSessions } from "@/hooks/queries/cohort";
import { useCreateSession, usePatchSession, useDeleteSession } from "@/hooks/mutations/cohort";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import type { CohortSession, CreateCohortSessionRequest } from "@/types/cohort";

// A session's start_time/end_time can read back as a full ISO-ish string (see the note on
// CohortSession in types/cohort.ts) rather than plain "HH:MM" — <input type="time"> only accepts
// "HH:MM", so this just takes the leading 5 characters regardless of what follows.
function toTimeInputValue(value: string): string {
  return value.slice(0, 5);
}

interface SessionFormState {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  meeting_url: string;
}

const EMPTY_SESSION_FORM: SessionFormState = {
  title: "",
  date: "",
  start_time: "",
  end_time: "",
  description: "",
  meeting_url: "",
};

function sessionToFormState(session: CohortSession): SessionFormState {
  return {
    title: session.title,
    date: session.date,
    start_time: toTimeInputValue(session.start_time),
    end_time: toTimeInputValue(session.end_time),
    description: session.description,
    meeting_url: session.meeting_url,
  };
}

export function CohortSessionsManager({ cohortId }: { cohortId: number }) {
  const { data: sessions, isLoading } = useSessions(cohortId);
  const createSession = useCreateSession(cohortId);
  const deleteSession = useDeleteSession(cohortId);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sorted = [...(sessions ?? [])].sort((a, b) => a.order - b.order);

  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
  };

  const handleCreate = (values: SessionFormState) => {
    const payload: CreateCohortSessionRequest = {
      ...values,
      order: sorted.length + 1,
    };
    createSession.mutate(payload, {
      onSuccess: () => {
        toast.success("Session added.");
        setAdding(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-900">Class Schedule</label>
        {!adding && (
          <button
            type="button"
            onClick={startAdd}
            className="text-xs font-medium text-secondary hover:underline"
          >
            + Add Session
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading sessions…</p>}
      {!isLoading && sorted.length === 0 && !adding && (
        <p className="text-sm text-gray-400">No sessions scheduled yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((session) =>
          editingId === session.id ? (
            <SessionForm
              key={session.id}
              cohortId={cohortId}
              session={session}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{session.title}</p>
                <p className="text-xs text-gray-400">
                  {session.date} · {toTimeInputValue(session.start_time)}–{toTimeInputValue(session.end_time)}
                </p>
                {session.meeting_url && (
                  <a
                    href={session.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-xs text-secondary hover:underline"
                  >
                    {session.meeting_url}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setEditingId(session.id);
                  }}
                  className="text-xs font-medium text-secondary hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(session.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {adding && (
        <SessionForm cohortId={cohortId} onDone={() => setAdding(false)} onCreate={handleCreate} isCreating={createSession.isPending} />
      )}

      <ConfirmDeleteModal
        open={deletingId != null}
        onClose={() => setDeletingId(null)}
        title="Delete this session?"
        description="This removes it from the cohort's schedule. This can't be undone."
        loading={deleteSession.isPending}
        onConfirm={() => {
          if (deletingId == null) return;
          deleteSession.mutate(deletingId, {
            onSuccess: () => {
              toast.success("Session deleted.");
              setDeletingId(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </div>
  );
}

// Doubles as both the "add" and "edit" form — `session` present means editing (PATCH via
// usePatchSession), absent means creating (the parent passes onCreate/isCreating instead, since
// useCreateSession needs to live in the parent to know the next `order`).
function SessionForm({
  cohortId,
  session,
  onDone,
  onCreate,
  isCreating,
}: {
  cohortId: number;
  session?: CohortSession;
  onDone: () => void;
  onCreate?: (values: SessionFormState) => void;
  isCreating?: boolean;
}) {
  const [values, setValues] = useState<SessionFormState>(
    session ? sessionToFormState(session) : EMPTY_SESSION_FORM,
  );
  const patchSession = usePatchSession(cohortId, session?.id ?? 0);

  const set = <K extends keyof SessionFormState>(key: K, value: SessionFormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (session) {
      patchSession.mutate(values, {
        onSuccess: () => {
          toast.success("Session updated.");
          onDone();
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      onCreate?.(values);
    }
  };

  const pending = session ? patchSession.isPending : !!isCreating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-secondary/30 bg-secondary/5 p-3">
      <Input
        label="Session Title"
        required
        placeholder="e.g. Week 1: Foundations"
        value={values.title}
        onChange={(e) => set("title", e.target.value)}
      />
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Date"
          type="date"
          required
          value={values.date}
          onChange={(e) => set("date", e.target.value)}
        />
        <Input
          label="Start Time"
          type="time"
          required
          value={values.start_time}
          onChange={(e) => set("start_time", e.target.value)}
        />
        <Input
          label="End Time"
          type="time"
          required
          value={values.end_time}
          onChange={(e) => set("end_time", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">Description</label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      </div>
      <Input
        label="Meeting Link"
        type="url"
        placeholder="https://zoom.us/j/..."
        value={values.meeting_url}
        onChange={(e) => set("meeting_url", e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <Button type="submit" loading={pending} className="w-auto px-4 py-2 text-xs">
          {session ? "Save Session" : "Add Session"}
        </Button>
      </div>
    </form>
  );
}
