"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateQuestionBank, usePatchQuestionBank } from "@/hooks/mutations/question-banks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ACCESS_DURATION_OPTIONS, type QuestionBank } from "@/types/question-bank";

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  access_duration: z.enum(["lifetime", "30_days", "60_days", "90_days", "180_days", "365_days"]),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

// Create (bank undefined) or edit. Access duration is set here and applies to every grant made later.
export function QuestionBankModal({
  open,
  onClose,
  bank,
}: {
  open: boolean;
  onClose: () => void;
  bank?: QuestionBank;
}) {
  const isEdit = !!bank;
  const createBank = useCreateQuestionBank();
  const patchBank = usePatchQuestionBank(bank?.id ?? 0);
  const isPending = createBank.isPending || patchBank.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: bank
      ? {
          name: bank.name,
          description: bank.description,
          access_duration: bank.access_duration,
          is_active: bank.is_active,
        }
      : { name: "", description: "", access_duration: "lifetime", is_active: true },
  });

  const onSubmit = (values: FormValues) => {
    const common = {
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
      access_duration: values.access_duration,
    };
    const done = {
      onSuccess: () => {
        toast.success(isEdit ? "Question bank updated." : "Question bank created.");
        onClose();
      },
      onError: (err: Error) => toast.error(err.message),
    };
    if (isEdit) patchBank.mutate({ ...common, is_active: values.is_active }, done);
    else createBank.mutate(common, done);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit question bank" : "New question bank"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
          <Input label="Name" required error={errors.name?.message} {...register("name")} />
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
              Access duration <span className="text-secondary">*</span>
            </label>
            <select className={selectClass} {...register("access_duration")}>
              {ACCESS_DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">How long a learner keeps access after it&apos;s granted or purchased.</p>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-secondary" {...register("is_active")} />
              Active
            </label>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button type="submit" loading={isPending} className="w-auto px-5">
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
