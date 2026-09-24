"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePrograms } from "@/hooks/queries/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OnboardReferralPartnerRequest } from "@/types/referral-partner";

const CURRENCY_OPTIONS = ["USD", "NGN"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const schema = z
  .object({
    name: z.string().min(1, "Partner name is required"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
    contact_email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
    is_active: z.boolean(),
    code: z.string().min(1, "Coupon code is required"),
    description: z.string().optional(),
    discount_type: z.enum(["percentage", "fixed_amount"]),
    discount_value: z.coerce.number().min(0, "Enter a valid amount"),
    currency: z.string().optional(),
    max_uses: z.coerce.number().min(1, "Max uses is required"),
    max_uses_per_user: z.coerce.number().min(1, "Max uses per user is required"),
    valid_from: z.string().min(1, "Start date is required"),
    valid_until: z.string().min(1, "End date is required"),
  })
  .refine((data) => data.discount_type !== "percentage" || data.discount_value <= 100, {
    message: "A percentage discount can't exceed 100",
    path: ["discount_value"],
  });
type FormValues = z.infer<typeof schema>;

export function ReferralPartnerOnboardForm({
  isPending,
  onSubmit,
  onClose,
}: {
  isPending: boolean;
  onSubmit: (payload: OnboardReferralPartnerRequest) => void;
  onClose: () => void;
}) {
  const { data: programsData } = usePrograms();
  const programs = programsData?.results ?? [];
  const [programIds, setProgramIds] = useState<number[]>([]);
  // Per-program override amount — only sent for programs the admin actually typed one for, so
  // the rest just use the coupon's blanket discount_value.
  const [programOverrides, setProgramOverrides] = useState<Record<number, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
      discount_type: "percentage",
      max_uses_per_user: 1,
    },
  });

  const discountType = watch("discount_type");
  const selectedPrograms = programs.filter((p) => programIds.includes(p.id));

  const addProgram = (id: number) => {
    if (!programIds.includes(id)) setProgramIds([...programIds, id]);
  };
  const removeProgram = (id: number) => {
    setProgramIds(programIds.filter((pid) => pid !== id));
    setProgramOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim(),
      contact_email: values.contact_email?.trim() ?? "",
      is_active: values.is_active,
      coupon: {
        code: values.code.trim(),
        description: values.description?.trim() ?? "",
        discount_type: values.discount_type,
        discount_value: values.discount_value.toFixed(2),
        currency: values.currency || "USD",
        max_uses: values.max_uses,
        max_uses_per_user: values.max_uses_per_user,
        valid_from: values.valid_from,
        valid_until: values.valid_until,
        is_active: true,
        applicable_program_ids: programIds,
        program_discounts: Object.entries(programOverrides)
          .filter(([, v]) => v.trim() !== "")
          .map(([program_id, discount_value]) => ({
            program_id: Number(program_id),
            discount_value: Number(discount_value).toFixed(2),
          })),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
        <p className="text-sm font-medium text-gray-900">Partner Details</p>
        <Input
          label="Partner Name"
          required
          placeholder="e.g. PMI Dallas Chapter"
          error={errors.name?.message}
          {...register("name", {
            onChange: (e) => {
              if (!slugTouched) setValue("slug", slugify(e.target.value));
            },
          })}
        />
        <Input
          label="Public Slug"
          required
          placeholder="e.g. pmi-dallas"
          error={errors.slug?.message}
          {...register("slug", { onChange: () => setSlugTouched(true) })}
        />
        <p className="-mt-2 text-xs text-gray-400">
          Members land at careercentra.com/partners/{watch("slug") || "…"}
        </p>
        <Input
          label="Contact Email"
          type="email"
          placeholder="chapter-lead@pmidallas.org"
          error={errors.contact_email?.message}
          {...register("contact_email")}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            {...register("is_active")}
          />
          Active
        </label>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
        <p className="text-sm font-medium text-gray-900">Partner Coupon</p>
        <Input
          label="Coupon Code"
          required
          placeholder="e.g. PMIDALLAS20"
          error={errors.code?.message}
          {...register("code")}
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Description</label>
          <textarea
            rows={2}
            placeholder="Internal note about this partnership"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("description")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Discount Type</label>
          <select
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("discount_type")}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={discountType === "fixed_amount" ? "Discount Amount" : "Discount Percentage"}
            type="number"
            step="0.01"
            required
            placeholder={discountType === "fixed_amount" ? "0.00" : "Enter discount"}
            error={errors.discount_value?.message}
            {...register("discount_value")}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Currency</label>
            <select
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("currency")}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Max Total Uses"
            type="number"
            required
            placeholder="e.g. 200"
            error={errors.max_uses?.message}
            {...register("max_uses")}
          />
          <Input
            label="Max Uses Per Member"
            type="number"
            required
            placeholder="e.g. 1"
            error={errors.max_uses_per_user?.message}
            {...register("max_uses_per_user")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Valid From"
            type="date"
            required
            error={errors.valid_from?.message}
            {...register("valid_from")}
          />
          <Input
            label="Valid Until"
            type="date"
            required
            error={errors.valid_until?.message}
            {...register("valid_until")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Applicable Programs</label>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) addProgram(Number(e.target.value));
            }}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          >
            <option value="">Select a program to restrict this coupon to…</option>
            {programs
              .filter((p) => !programIds.includes(p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
          </select>

          {selectedPrograms.map((p) => (
            <div key={p.id} className="flex items-center gap-2 px-1 py-1.5">
              <span className="flex-1 truncate text-sm text-gray-700">{p.title}</span>
              <input
                value={programOverrides[p.id] ?? ""}
                onChange={(e) =>
                  setProgramOverrides((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                type="number"
                step="0.01"
                placeholder="Override %/amount"
                className="w-36 rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
              <button
                type="button"
                onClick={() => removeProgram(p.id)}
                className="shrink-0 text-xs font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Leave the program list empty to apply to all programs. An override replaces the blanket
            discount for that one program only.
          </p>
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
        <Button type="submit" loading={isPending} className="w-auto px-6">
          Onboard Partner
        </Button>
      </div>
    </form>
  );
}
