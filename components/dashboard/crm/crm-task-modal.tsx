"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAdminUsers } from "@/hooks/queries/admin-users";
import { useCreateCrmTask, usePatchCrmTask } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { CrmTask } from "@/types/crm";

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignee_id: z.string().min(1, "Choose who this is assigned to"),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "completed"]),
});
type FormValues = z.infer<typeof schema>;

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// `leadId` is required to create a task (every task belongs to a lead); editing keeps the task's
// existing lead untouched.
export function CrmTaskModal({
  open,
  onClose,
  leadId,
  task,
}: {
  open: boolean;
  onClose: () => void;
  leadId?: string;
  task?: CrmTask;
}) {
  const isEdit = !!task;
  const users = useAdminUsers();
  const createTask = useCreateCrmTask();
  const patchTask = usePatchCrmTask();
  const isPending = createTask.isPending || patchTask.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: task
      ? {
          title: task.title,
          description: task.description,
          assignee_id: String(task.assignee.id),
          due_date: toLocalInput(task.due_date),
          priority: task.priority,
          status: task.status,
        }
      : {
          title: "",
          description: "",
          assignee_id: "",
          due_date: "",
          priority: "low",
          status: "pending",
        },
  });

  const onSubmit = (values: FormValues) => {
    const common = {
      title: values.title.trim(),
      description: values.description?.trim() ?? "",
      assignee_id: Number(values.assignee_id),
      due_date: new Date(values.due_date).toISOString(),
      priority: values.priority,
      status: values.status,
    };
    const done = {
      onSuccess: () => {
        toast.success(isEdit ? "Task updated." : "Task added.");
        onClose();
      },
      onError: (err: Error) => toast.error(err.message),
    };
    if (isEdit) {
      patchTask.mutate({ id: task.id, payload: common }, done);
    } else if (leadId) {
      createTask.mutate({ lead: leadId, ...common }, done);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Task" : "New Follow-up Task"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
          <Input label="Title" required error={errors.title?.message} {...register("title")} />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("description")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Assignee <span className="text-secondary">*</span>
            </label>
            <select className={selectClass} {...register("assignee_id")}>
              <option value="">Select a team member</option>
              {users.data?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </option>
              ))}
            </select>
            {errors.assignee_id && <p className="text-xs text-red-500">{errors.assignee_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due"
              type="datetime-local"
              required
              error={errors.due_date?.message}
              {...register("due_date")}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">
                Priority <span className="text-secondary">*</span>
              </label>
              <select className={selectClass} {...register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Status <span className="text-secondary">*</span>
            </label>
            <select className={selectClass} {...register("status")}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button type="submit" loading={isPending} className="w-auto px-5">
              {isEdit ? "Save" : "Add Task"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
