"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCrmTasks } from "@/hooks/queries/crm";
import { useDeleteCrmTask } from "@/hooks/mutations/crm";
import { CrmTaskModal } from "@/components/dashboard/crm/crm-task-modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatOrdinalDateTime } from "@/lib/format";
import type { CrmTask } from "@/types/crm";

const COLUMNS = ["Task", "Assignee", "Due", "Priority", "Status", "Reminder", "Action"];

// Due within 24h or already past due — the same window the hourly reminder job uses.
function isDueSoon(task: CrmTask): boolean {
  const due = new Date(task.due_date).getTime();
  return due - Date.now() <= 24 * 60 * 60 * 1000;
}

export function CrmTasksPage({ basePath }: { basePath: string }) {
  const { data, isLoading } = useCrmTasks({ page_size: 100 });
  const deleteTask = useDeleteCrmTask();
  const [editing, setEditing] = useState<CrmTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmTask | null>(null);
  const tasks = data?.results ?? [];

  return (
    <div>
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Follow-up Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every open follow-up across leads. Add tasks from a lead&apos;s page.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
              {COLUMNS.map((col) => (
                <th key={col} className="px-5 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeleton columns={COLUMNS} />}
            {!isLoading && tasks.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No follow-up tasks yet.
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4">
                  <Link href={`${basePath}/leads/${task.lead}`} className="font-medium text-gray-900 hover:underline">
                    {task.title}
                  </Link>
                  {task.description && <p className="line-clamp-1 text-xs text-gray-400">{task.description}</p>}
                </td>
                <td className="px-5 py-4 text-gray-600">{task.assignee.full_name || task.assignee.email}</td>
                <td className={`px-5 py-4 ${isDueSoon(task) ? "font-medium text-red-600" : "text-gray-600"}`}>
                  {formatOrdinalDateTime(task.due_date)}
                </td>
                <td className="px-5 py-4 text-gray-600">{task.priority}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={task.status} tone="gray" />
                </td>
                <td className="px-5 py-4 text-gray-500">{task.reminder_sent ? "Sent" : "—"}</td>
                <td className="px-5 py-4">
                  <ActionsMenu
                    items={[
                      { label: "Edit", onClick: () => setEditing(task) },
                      { label: "Delete", tone: "danger", onClick: () => setDeleteTarget(task) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <CrmTaskModal open onClose={() => setEditing(null)} task={editing} />}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete task"
        description={`Delete "${deleteTarget?.title}"?`}
        loading={deleteTask.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTask.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Task deleted.");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
