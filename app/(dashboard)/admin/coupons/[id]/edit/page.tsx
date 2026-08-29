"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCoupon } from "@/hooks/queries/coupon";
import { usePatchCoupon } from "@/hooks/mutations/coupon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().max(600, "Max 600 characters").optional(),
  discount_value: z.coerce.number().min(0).max(100, "Enter a valid percentage"),
  valid_from: z.string().min(1, "Start date is required"),
  valid_until: z.string().min(1, "End date is required"),
});
type FormValues = z.infer<typeof schema>;

const EditCouponPage = () => {
  const params = useParams<{ id: string }>();
  const couponId = Number(params.id);
  const router = useRouter();
  const { data: coupon, isLoading } = useCoupon(couponId);
  const patchCoupon = usePatchCoupon(couponId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!coupon) return;
    reset({
      code: coupon.code,
      description: coupon.description,
      discount_value: parseFloat(coupon.discount_value),
      valid_from: coupon.valid_from?.slice(0, 10) ?? "",
      valid_until: coupon.valid_until?.slice(0, 10) ?? "",
    });
  }, [coupon, reset]);

  const onSubmit = (values: FormValues) => {
    patchCoupon.mutate(
      {
        code: values.code,
        description: values.description ?? "",
        discount_value: values.discount_value.toFixed(2),
        valid_from: values.valid_from,
        valid_until: values.valid_until,
      },
      {
        onSuccess: () => {
          toast.success("Coupon updated.");
          router.push("/admin/coupons");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) return <p className="text-sm text-gray-400">Loading…</p>;
  if (!coupon) return <p className="text-sm text-gray-400">Coupon not found.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900">Edit Coupon</h1>
      <p className="mt-1 text-sm text-gray-500">Update the discount code, value, and validity window.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
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

        <Input
          label="Discount Percentage"
          type="number"
          step="0.01"
          required
          placeholder="Enter discount"
          error={errors.discount_value?.message}
          {...register("discount_value")}
        />

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

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/coupons")}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <Button type="submit" loading={patchCoupon.isPending} className="w-auto px-6">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCouponPage;
