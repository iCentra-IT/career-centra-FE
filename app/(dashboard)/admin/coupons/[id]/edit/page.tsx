"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCoupon } from "@/hooks/queries/coupon";
import { usePatchCoupon } from "@/hooks/mutations/coupon";
import { CouponForm } from "@/components/dashboard/coupon-form";
import { FormSkeleton } from "@/components/ui/skeleton";

const EditCouponPage = () => {
  const params = useParams<{ id: string }>();
  const couponId = Number(params.id);
  const router = useRouter();
  const { data: coupon, isLoading } = useCoupon(couponId);
  const patchCoupon = usePatchCoupon(couponId);

  if (isLoading) return <FormSkeleton fields={6} />;
  if (!coupon) return <p className="text-sm text-gray-400">Coupon not found.</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Edit Coupon</h1>
      <p className="mt-1 text-sm text-gray-500">Update the discount code, value, and validity window.</p>

      <div className="mt-8">
        <CouponForm
          submitLabel="Save"
          isPending={patchCoupon.isPending}
          onClose={() => router.push("/admin/coupons")}
          initialValues={{
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type === "fixed_amount" ? "fixed_amount" : "percentage",
            discount_value: parseFloat(coupon.discount_value),
            currency: coupon.currency || "USD",
            max_uses: coupon.max_uses ?? 0,
            valid_from: coupon.valid_from?.slice(0, 10) ?? "",
            valid_until: coupon.valid_until?.slice(0, 10) ?? "",
            is_active: coupon.is_active,
            applicable_program_ids: coupon.applicable_programs.map((p) => p.id),
          }}
          onSubmit={(payload) =>
            patchCoupon.mutate(payload, {
              onSuccess: () => {
                toast.success("Coupon updated.");
                router.push("/admin/coupons");
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      </div>
    </div>
  );
};

export default EditCouponPage;
