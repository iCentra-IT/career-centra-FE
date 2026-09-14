"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateCoupon } from "@/hooks/mutations/coupon";
import { CouponForm } from "@/components/dashboard/coupon-form";

const CreateCouponPage = () => {
  const router = useRouter();
  const createCoupon = useCreateCoupon();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Create Coupon</h1>
      <p className="mt-1 text-sm text-gray-500">Set the discount code, value, and validity window.</p>

      <div className="mt-8">
        <CouponForm
          submitLabel="Create"
          isPending={createCoupon.isPending}
          onClose={() => router.push("/admin/coupons")}
          onSubmit={(payload) =>
            createCoupon.mutate(payload, {
              onSuccess: () => {
                toast.success("Coupon created.");
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

export default CreateCouponPage;
