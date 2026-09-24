"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useInitiateCheckout } from "@/hooks/mutations/enrollment";
import { useValidateCoupon } from "@/hooks/mutations/coupon";
import type { ValidateCouponResponse } from "@/types/coupon";
import { formatMoney } from "@/lib/format";

export function EnrolButton({
  cohortId,
  enrollmentOpen = true,
  withCoupon = false,
  programId,
  amount,
  currency,
  className,
  children,
}: {
  cohortId?: number;
  enrollmentOpen?: boolean;
  // Show an optional "Have a coupon code?" field — the direct-enrol equivalent of the cart's
  // coupon box. Off by default so compact usages (e.g. the schedule table) stay a bare button.
  withCoupon?: boolean;
  // Needed to preview a coupon's discount via POST /api/coupons/coupons/validate/ before checkout
  // — the "Apply" button only appears once all three are known. The actual applied discount is
  // still re-validated server-side at checkout via coupon_code, this is just a live preview.
  programId?: number;
  amount?: string;
  currency?: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initiateCheckout = useInitiateCheckout();
  const validateCoupon = useValidateCoupon();

  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<ValidateCouponResponse | null>(null);
  const canPreview = withCoupon && programId != null && !!amount && !!currency;

  const handleCouponChange = (value: string) => {
    setCoupon(value);
    // Editing after a successful preview invalidates it — clear so stale numbers don't linger.
    if (appliedDiscount) setAppliedDiscount(null);
  };

  const handleApplyCoupon = () => {
    const code = coupon.trim();
    if (!code || !canPreview || !programId || !amount || !currency) return;

    validateCoupon.mutate(
      { code, program_id: programId, currency, amount },
      {
        onSuccess: (data) => setAppliedDiscount(data),
        onError: (err) => {
          setAppliedDiscount(null);
          toast.error(err.message);
        },
      },
    );
  };

  const startCheckout = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!cohortId) return;

    initiateCheckout.mutate(
      {
        cohort_ids: [cohortId],
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
      <label className="self-start text-xs font-medium text-gray-400">Have a coupon code?</label>
      <div className="flex gap-2">
        <input
          value={coupon}
          onChange={(e) => handleCouponChange(e.target.value)}
          placeholder="Coupon code (optional)"
          autoComplete="off"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        {canPreview && (
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={!coupon.trim() || validateCoupon.isPending}
            className="shrink-0 rounded-md border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {validateCoupon.isPending ? "Checking…" : "Apply"}
          </button>
        )}
      </div>
      {appliedDiscount && currency && (
        <p className="text-xs text-green-600">
          &ldquo;{appliedDiscount.code}&rdquo; applied — {formatMoney(appliedDiscount.discount_amount, currency)}{" "}
          off. New total: {formatMoney(appliedDiscount.final_amount, currency)}.
        </p>
      )}
      {button}
    </div>
  );
}
