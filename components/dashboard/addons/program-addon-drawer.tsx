"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateProgramAddon, useDeleteProgramAddon, usePatchProgramAddon } from "@/hooks/mutations/addons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ADDON_KIND_OPTIONS, type ProgramAddon, type ProgramAddonWriteRequest } from "@/types/addon";

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  kind: z.enum(["support", "coaching_group", "coaching_personalized", "exam_membership", "exam_non_membership", "question_bank"]),
  description: z.string().optional(),
  price_usd: z.string().min(1, "USD price is required"),
  price_ngn: z.string().optional(),
  selection_group: z.string().optional(),
  sort_order: z.coerce.number().int().min(0, "Use 0 or more"),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: "",
  kind: "support",
  description: "",
  price_usd: "",
  price_ngn: "",
  selection_group: "",
  sort_order: 0,
  is_active: true,
};

// Slide-over for creating or editing one program add-on. `addon` undefined = create.
export function ProgramAddonDrawer({
  programSlug,
  addon,
  open,
  onClose,
}: {
  programSlug: string;
  addon?: ProgramAddon;
  open: boolean;
  onClose: () => void;
}) {
  const isEdit = !!addon;
  const create = useCreateProgramAddon(programSlug);
  const patch = usePatchProgramAddon(programSlug);
  const remove = useDeleteProgramAddon(programSlug);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isPending = create.isPending || patch.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // Reset whenever a different add-on (or a fresh create) opens in the drawer.
  useEffect(() => {
    if (!open) return;
    reset(
      addon
        ? {
            name: addon.name,
            kind: addon.kind,
            description: addon.description,
            price_usd: addon.price_usd,
            price_ngn: addon.pricing_mode === "usd_only" ? "" : addon.price_ngn,
            selection_group: addon.selection_group,
            sort_order: addon.sort_order,
            is_active: addon.is_active,
          }
        : EMPTY,
    );
  }, [open, addon, reset]);

  if (!open) return null;

  const onSubmit = (v: FormValues) => {
    const hasNgn = !!v.price_ngn && parseFloat(v.price_ngn) > 0;
    const payload: ProgramAddonWriteRequest = {
      name: v.name.trim(),
      kind: v.kind,
      description: v.description?.trim() ?? "",
      price_usd: Number(v.price_usd).toFixed(2),
      price_ngn: hasNgn ? Number(v.price_ngn).toFixed(2) : "0.00",
      // A blank NGN price means the add-on sells in USD only.
      pricing_mode: hasNgn ? "dual" : "usd_only",
      selection_group: v.selection_group?.trim() ?? "",
      sort_order: v.sort_order,
      is_active: v.is_active,
      question_bank: addon?.question_bank ?? null,
    };
    const done = {
      onSuccess: () => {
        toast.success(isEdit ? "Add-on updated." : "Add-on created.");
        onClose();
      },
      onError: (err: Error) => toast.error(err.message),
    };
    if (addon) patch.mutate({ id: addon.id, payload }, done);
    else create.mutate(payload, done);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-gray-900/30" onClick={onClose} aria-hidden="true" />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">{isEdit ? "Edit add-on" : "New add-on"}</p>
            <h2 className="text-lg font-semibold text-gray-900">{isEdit ? addon?.name : "Create add-on"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form id="addon-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
          <Input label="Name" required error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Kind</label>
              <select className={selectClass} {...register("kind")}>
                {ADDON_KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Selection group"
              placeholder="e.g. Coaching"
              error={errors.selection_group?.message}
              {...register("selection_group")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base price (USD)" type="number" step="0.01" required error={errors.price_usd?.message} {...register("price_usd")} />
            <Input
              label="Base price (NGN)"
              type="number"
              step="0.01"
              placeholder="Leave blank for USD only"
              error={errors.price_ngn?.message}
              {...register("price_ngn")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort order" type="number" error={errors.sort_order?.message} {...register("sort_order")} />
            <label className="mt-7 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-secondary" {...register("is_active")} />
              Active
            </label>
          </div>
          {isEdit && addon?.question_bank && (
            <p className="rounded-xl bg-secondary/5 p-3 text-xs text-gray-600">
              Unlocks question bank #{addon.question_bank}. Change which bank it unlocks from the bank&apos;s own page.
            </p>
          )}
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
          {isEdit ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm font-medium text-red-600 hover:underline">
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button type="submit" form="addon-form" loading={isPending} className="w-auto px-5">
              {isEdit ? "Save changes" : "Create add-on"}
            </Button>
          </div>
        </div>
      </aside>

      {addon && (
        <ConfirmDeleteModal
          open={confirmDelete}
          title="Delete add-on"
          description={`Delete "${addon.name}"? Learners who already bought it keep their purchase.`}
          loading={remove.isPending}
          onConfirm={() =>
            remove.mutate(addon.id, {
              onSuccess: () => {
                toast.success("Add-on deleted.");
                setConfirmDelete(false);
                onClose();
              },
              onError: (err) => toast.error(err.message),
            })
          }
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
