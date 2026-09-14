"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePrograms } from "@/hooks/queries/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CreateCouponRequest } from "@/types/coupon";

const CURRENCY_OPTIONS = ["USD", "NGN"];

const schema = z
  .object({
    code: z.string().min(1, "Code is required"),
    description: z.string().max(600, "Max 600 characters").optional(),
    discount_type: z.enum(["percentage", "fixed_amount"]),
    discount_value: z.coerce.number().min(0, "Enter a valid amount"),
    currency: z.string().optional(),
    max_uses: z.coerce.number().min(1, "Max uses is required"),
    valid_from: z.string().min(1, "Start date is required"),
    valid_until: z.string().min(1, "End date is required"),
    is_active: z.boolean(),
  })
  .refine((data) => data.discount_type !== "percentage" || data.discount_value <= 100, {
    message: "A percentage discount can't exceed 100",
    path: ["discount_value"],
  });
type FormValues = z.infer<typeof schema>;

export interface CouponFormInitialValues {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  currency: string;
  max_uses: number;
  valid_from: string; // yyyy-mm-dd
  valid_until: string; // yyyy-mm-dd
  is_active: boolean;
  applicable_program_ids: number[];
}

interface CouponFormProps {
  initialValues?: CouponFormInitialValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: CreateCouponRequest) => void;
  onClose: () => void;
}

export function CouponForm({
  initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onClose,
}: CouponFormProps) {
  const { data: programsData } = usePrograms();
  const programs = programsData?.results ?? [];
  const [programIds, setProgramIds] = useState<number[]>(
    initialValues?.applicable_program_ids ?? [],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { discount_type: "percentage", is_active: true },
  });

  useEffect(() => {
    if (!initialValues) return;
    reset(initialValues);
    setProgramIds(initialValues.applicable_program_ids);
  }, [initialValues, reset]);

  const discountType = watch("discount_type");
  const selectedPrograms = programs.filter((p) => programIds.includes(p.id));

  const addProgram = (id: number) => {
    if (!programIds.includes(id)) setProgramIds([...programIds, id]);
  };
  const removeProgram = (id: number) => setProgramIds(programIds.filter((pid) => pid !== id));

  const submit = (values: FormValues) => {
    onSubmit({
      code: values.code.trim(),
      description: values.description?.trim() ?? "",
      discount_type: values.discount_type,
      discount_value: values.discount_value.toFixed(2),
      currency: values.discount_type === "fixed_amount" ? values.currency || "USD" : "",
      max_uses: values.max_uses,
      valid_from: values.valid_from,
      valid_until: values.valid_until,
      is_active: values.is_active,
      applicable_program_ids: programIds,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-2xl flex-col gap-5">
      <Input
        label="Code"
        required
        placeholder="Enter code"
        error={errors.code?.message}
        {...register("code")}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">Description</label>
        <textarea
          rows={4}
          placeholder="Enter a brief description here"
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          {...register("description")}
        />
        <p className="text-xs text-gray-400">Max Character: 600 words</p>
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">
          Discount Type <span className="text-secondary">*</span>
        </label>
        <select
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          {...register("discount_type")}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed_amount">Fixed Amount</option>
        </select>
      </div>

      <div className={discountType === "fixed_amount" ? "grid grid-cols-2 gap-3" : ""}>
        <Input
          label={discountType === "fixed_amount" ? "Discount Amount" : "Discount Percentage"}
          type="number"
          step="0.01"
          required
          placeholder={discountType === "fixed_amount" ? "0.00" : "Enter discount"}
          error={errors.discount_value?.message}
          {...register("discount_value")}
        />
        {discountType === "fixed_amount" && (
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
        )}
      </div>

      <Input
        label="Max Uses"
        type="number"
        required
        placeholder="e.g. 100"
        error={errors.max_uses?.message}
        {...register("max_uses")}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          required
          error={errors.valid_from?.message}
          {...register("valid_from")}
        />
        <Input
          label="End Date"
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
          <div key={p.id} className="flex items-center justify-between px-1 py-1.5">
            <span className="text-sm text-gray-700">{p.title}</span>
            <button
              type="button"
              onClick={() => removeProgram(p.id)}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <p className="text-xs text-gray-400">Leave empty to apply to all programs.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
          {...register("is_active")}
        />
        Active
      </label>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
        <Button type="submit" loading={isPending} className="w-auto px-6">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
