"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCrmLead, useCrmLeadNotes, useCrmTasks } from "@/hooks/queries/crm";
import {
  useCreateCrmLeadNote,
  useDeleteCrmLeadNote,
  useDeleteCrmTask,
  usePatchCrmLeadNote,
} from "@/hooks/mutations/crm";
import { CrmTaskModal } from "@/components/dashboard/crm/crm-task-modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { DetailPageSkeleton } from "@/components/ui/skeleton";
import { formatOrdinalDateTime, formatShortDate } from "@/lib/format";
import { crmLeadName } from "@/lib/crm";
import type { CrmLeadNote, CrmTask } from "@/types/crm";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{value || "—"}</p>
    </div>
  );
}

function NotesSection({ leadId }: { leadId: string }) {
  const { data: notes, isLoading } = useCrmLeadNotes(leadId);
  const createNote = useCreateCrmLeadNote(leadId);
  const patchNote = usePatchCrmLeadNote(leadId);
  const deleteNote = useDeleteCrmLeadNote(leadId);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<CrmLeadNote | null>(null);
  const [editText, setEditText] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    createNote.mutate(text, {
      onSuccess: () => setDraft(""),
      onError: (err) => toast.error(err.message),
    });
  };

  const saveEdit = () => {
    if (!editing || !editText.trim()) return;
    patchNote.mutate(
      { id: editing.id, note: editText.trim() },
      {
        onSuccess: () => setEditing(null),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">Notes</h2>
      <p className="mt-1 text-xs text-gray-400">Log calls, voicemails and conversations.</p>

      <div className="mt-4 flex flex-col gap-2">
        <textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder='e.g. "Called, left voicemail"'
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <div className="flex justify-end">
          <Button type="button" onClick={submit} loading={createNote.isPending} className="w-auto px-5">
            Add Note
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col divide-y divide-gray-100">
        {isLoading && <p className="text-sm text-gray-400">Loading notes…</p>}
        {!isLoading && notes?.length === 0 && <p className="text-sm text-gray-400">No notes yet.</p>}
        {notes?.map((n) => (
          <div key={n.id} className="py-4">
            {editing?.id === n.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <Button type="button" onClick={saveEdit} loading={patchNote.isPending} className="w-auto px-4">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{n.note}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {n.author.full_name || n.author.email} · {formatOrdinalDateTime(n.created_at)}
                  </span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(n);
                        setEditText(n.note);
                      }}
                      className="hover:text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteNote.mutate(n.id, {
                          onError: (err) => toast.error(err.message),
                        })
                      }
                      className="hover:text-red-600"
                    >
                      Delete
                    </button>
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TasksSection({ leadId }: { leadId: string }) {
  const { data, isLoading } = useCrmTasks({ lead: leadId, page_size: 100 });
  const deleteTask = useDeleteCrmTask();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CrmTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmTask | null>(null);
  const tasks = data?.results ?? [];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Follow-up Tasks</h2>
          <p className="mt-1 text-xs text-gray-400">The assignee gets an in-app reminder within 24 hours of the due date.</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)} className="w-auto px-4">
          Add Task
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400">
              <th className="px-3 py-2 font-medium">Task</th>
              <th className="px-3 py-2 font-medium">Assignee</th>
              <th className="px-3 py-2 font-medium">Due</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-gray-400">
                  Loading tasks…
                </td>
              </tr>
            )}
            {!isLoading && tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-gray-400">
                  No tasks for this lead yet.
                </td>
              </tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-3 text-gray-900">{t.title}</td>
                <td className="px-3 py-3 text-gray-600">{t.assignee.full_name || t.assignee.email}</td>
                <td className="px-3 py-3 text-gray-600">{formatOrdinalDateTime(t.due_date)}</td>
                <td className="px-3 py-3 text-gray-600">{t.priority}</td>
                <td className="px-3 py-3">
                  <StatusBadge label={t.status} tone="gray" />
                </td>
                <td className="px-3 py-3 text-right">
                  <button type="button" onClick={() => setEditing(t)} className="text-xs text-gray-500 hover:text-gray-900">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(t)}
                    className="ml-3 text-xs text-gray-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CrmTaskModal open={creating} onClose={() => setCreating(false)} leadId={leadId} />
      {editing && <CrmTaskModal open onClose={() => setEditing(null)} task={editing} />}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete task"
        description={`Delete "${deleteTarget?.title}"?`}
        loading={deleteTask.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTask.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            onError: (err) => toast.error(err.message),
          });
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}

export function CrmLeadDetailPage({ basePath, leadId }: { basePath: string; leadId: string }) {
  const { data: lead, isLoading, isError } = useCrmLead(leadId);

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !lead) return <p className="text-sm text-gray-400">Lead not found.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`${basePath}/leads`} className="text-sm text-gray-400 hover:text-gray-600">
            ← Leads
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">{crmLeadName(lead)}</h1>
          <p className="mt-1 text-sm text-gray-500">{lead.email}</p>
        </div>
        <Link
          href={`${basePath}/leads/${lead.id}/edit`}
          className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit Lead
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="h-fit rounded-2xl border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Phone" value={lead.phone} />
            <Field label="Company" value={lead.company} />
            <Field label="Job Title" value={lead.job_title} />
            <Field label="Country" value={lead.detected_country} />
            <Field label="Source" value={lead.source} />
            <Field label="Campaign" value={lead.campaign_source} />
            <Field label="Platform" value={lead.platform} />
            <Field label="Audience" value={lead.audience_type} />
            <Field label="Intent" value={lead.intent_level} />
            <Field label="Status" value={lead.status} />
            <Field label="Next Follow-up" value={lead.next_follow_up_date ? formatShortDate(lead.next_follow_up_date) : null} />
            <Field label="Captured" value={formatOrdinalDateTime(lead.created_at)} />
          </div>
          {lead.url && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-gray-400">Page</p>
              <a href={lead.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-secondary hover:underline">
                {lead.url}
              </a>
            </div>
          )}
          {lead.message && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-gray-400">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{lead.message}</p>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <NotesSection leadId={lead.id} />
          <TasksSection leadId={lead.id} />
        </div>
      </div>
    </div>
  );
}
