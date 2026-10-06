"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProgramAddons } from "@/hooks/queries/addons";
import { useCreateProgramAddon, useDeleteProgramAddon, usePatchProgramAddon } from "@/hooks/mutations/addons";
import { useQuestionBanks } from "@/hooks/queries/question-banks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { Card, EmptyState } from "@/components/dashboard/dashboard-kit";
import { ADDON_KIND_OPTIONS, type ProgramAddon, type ProgramAddonWriteRequest } from "@/types/addon";

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

const KIND_OPTIONS = ADDON_KIND_OPTIONS;

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    kind: z.enum(["support", "coaching_group", "coaching_personalized", "exam_membership", "exam_non_membership", "question_bank"]),
    price_usd: z.string().min(1, "USD price is required"),
    price_ngn: z.string().optional(),
    pricing_mode: z.enum(["dual", "usd_only"]),
    selection_group: z.string().optional(),
    question_bank: z.string().optional(),
    sort_order: z.coerce.number().int().min(0),
    is_active: z.boolean(),
  })
  .refine((d) => d.kind !== "question_bank" || !!d.question_bank, {
    message: "Pick the question bank this add-on unlocks",
    path: ["question_bank"],
  });
type FormValues = z.infer<typeof schema>;

function AddonModal({
  programSlug,
  addon,
  onClose,
}: {
  programSlug: string;
  addon?: ProgramAddon;
  onClose: () => void;
}) {
  const isEdit = !!addon;
  const create = useCreateProgramAddon(programSlug);
  const patch = usePatchProgramAddon(programSlug);
  const { data: banks = [] } = useQuestionBanks();
  const isPending = create.isPending || patch.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: addon
      ? {
          name: addon.name,
          description: addon.description,
          kind: addon.kind,
          price_usd: addon.price_usd,
          price_ngn: addon.price_ngn,
          pricing_mode: addon.pricing_mode === "usd_only" ? "usd_only" : "dual",
          selection_group: addon.selection_group,
          question_bank: addon.question_bank ? String(addon.question_bank) : "",
          sort_order: addon.sort_order,
          is_active: addon.is_active,
        }
      : {
          name: "",
          description: "",
          kind: "support",
          price_usd: "",
          price_ngn: "",
          pricing_mode: "dual",
          selection_group: "",
          question_bank: "",
          sort_order: 0,
          is_active: true,
        },
  });
  const kind = useWatch({ control, name: "kind" });
  const pricingMode = useWatch({ control, name: "pricing_mode" });

  const onSubmit = (v: FormValues) => {
    const payload: ProgramAddonWriteRequest = {
      name: v.name.trim(),
      description: v.description?.trim() ?? "",
      kind: v.kind,
      price_usd: Number(v.price_usd).toFixed(2),
      price_ngn: pricingMode === "dual" && v.price_ngn ? Number(v.price_ngn).toFixed(2) : "0.00",
      pricing_mode: v.pricing_mode,
      is_active: v.is_active,
      sort_order: v.sort_order,
      selection_group: v.selection_group?.trim() ?? "",
      question_bank: v.kind === "question_bank" && v.question_bank ? Number(v.question_bank) : null,
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
    <Modal open onClose={onClose} size="lg">
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit add-on" : "New add-on"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
          <Input label="Name" required error={errors.name?.message} {...register("name")} />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Description</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Kind</label>
              <select className={selectClass} {...register("kind")}>
                {KIND_OPTIONS.map((o) => (
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
          {kind === "question_bank" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Question bank</label>
              <select className={selectClass} {...register("question_bank")}>
                <option value="">Choose a bank</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.question_bank && <p className="text-xs text-red-500">{errors.question_bank.message}</p>}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Pricing</label>
            <select className={selectClass} {...register("pricing_mode")}>
              <option value="dual">Dual (USD + NGN)</option>
              <option value="usd_only">USD only</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (USD)" type="number" step="0.01" required error={errors.price_usd?.message} {...register("price_usd")} />
            {pricingMode === "dual" && (
              <Input label="Price (NGN)" type="number" step="0.01" error={errors.price_ngn?.message} {...register("price_ngn")} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sort order" type="number" error={errors.sort_order?.message} {...register("sort_order")} />
            <label className="mt-7 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-secondary" {...register("is_active")} />
              Active
            </label>
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
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export function ProgramAddonsManager({ programSlug }: { programSlug: string }) {
  const { data: addons, isLoading } = useProgramAddons(programSlug);
  const remove = useDeleteProgramAddon(programSlug);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProgramAddon | null>(null);
  const [deleting, setDeleting] = useState<ProgramAddon | null>(null);

  return (
    <Card title="Add-ons">
      <div className="-mt-2 mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400">Extras learners can buy with this program — coaching, question banks, support.</p>
        <Button type="button" onClick={() => setCreating(true)} className="w-auto px-4">
          Add add-on
        </Button>
      </div>

      {isLoading ? (
        <ListRowSkeleton rows={2} />
      ) : !addons?.length ? (
        <EmptyState>No add-ons yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-gray-100">
          {addons.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {a.name}
                  {a.selection_group && <span className="ml-2 text-xs text-gray-400">· group: {a.selection_group}</span>}
                </p>
                <p className="text-xs text-gray-500">
                  ${a.price_usd}
                  {a.pricing_mode !== "usd_only" && ` · ₦${a.price_ngn}`} · {a.kind.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={a.is_active ? "Active" : "Hidden"} tone={a.is_active ? "green" : "gray"} />
                <button type="button" onClick={() => setEditing(a)} className="text-sm text-gray-500 hover:text-gray-900">
                  Edit
                </button>
                <button type="button" onClick={() => setDeleting(a)} className="text-sm text-gray-500 hover:text-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && <AddonModal programSlug={programSlug} onClose={() => setCreating(false)} />}
      {editing && <AddonModal programSlug={programSlug} addon={editing} onClose={() => setEditing(null)} />}
      <ConfirmDeleteModal
        open={!!deleting}
        title="Delete add-on"
        description={`Delete "${deleting?.name}"? Learners who already bought it keep their purchase.`}
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Add-on deleted.");
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
