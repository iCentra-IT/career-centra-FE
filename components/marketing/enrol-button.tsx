"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useStudentProfile } from "@/hooks/queries/students";
import { useInitiateCheckout } from "@/hooks/mutations/enrollment";

export function EnrolButton({
  cohortId,
  enrollmentOpen = true,
  withCoupon = false,
  className,
  children,
}: {
  cohortId?: number;
  enrollmentOpen?: boolean;
  // Show an optional "Have a coupon code?" field — the direct-enrol equivalent of the cart's
  // coupon box. Off by default so compact usages (e.g. the schedule table) stay a bare button.
  withCoupon?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { data: studentProfile } = useStudentProfile();
  const initiateCheckout = useInitiateCheckout();

  // const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");

  const startCheckout = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!cohortId) return;

    const countryCode = studentProfile?.country || "US";
    const currency = countryCode === "NG" ? "NGN" : "USD";

    initiateCheckout.mutate(
      {
        cohort_ids: [cohortId],
        country_code: countryCode,
        currency,
        coupon_code: coupon.trim(),
      },
      {
        onSuccess: (data) => {
          // If initiate now returns an order id, let the confirm screen track it (same as the
          // cart checkout flow); otherwise it falls back to verifying by payment reference.
          if (data.order_id != null) {
            try {
              sessionStorage.setItem("checkout_order_id", String(data.order_id));
            } catch {
              /* sessionStorage may be unavailable */
            }
          }
          window.location.href = data.gateway_url;
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const disabled = !!user && (!cohortId || !enrollmentOpen || initiateCheckout.isPending);

  const button = (
    <button
      type="button"
      onClick={startCheckout}
      disabled={disabled}
      title={user && !enrollmentOpen ? "Enrollment isn't open for this cohort yet" : undefined}
      className={className}
    >
      {initiateCheckout.isPending ? "Redirecting…" : children}
    </button>
  );

  if (!withCoupon) return button;

  return (
    <div className="flex w-full flex-col gap-2">
      {/* {showCoupon ? ( */}
      <button
          type="button"
          // onClick={() => setShowCoupon(true)}
          className="self-start text-xs font-medium text-gray-400"
        >
          Have a coupon code?
        </button>
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Coupon code (optional)"
          autoComplete="off"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      {/* // ) : ( */}
        
      {/* )} */}
      {button}
    </div>
  );
}
