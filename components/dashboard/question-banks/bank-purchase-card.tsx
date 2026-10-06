"use client";

import { toast } from "sonner";
import { useBankPurchaseOptions } from "@/hooks/queries/question-banks";
import { useInitiateStandaloneAddons } from "@/hooks/mutations/enrollment";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, HeroBanner } from "@/components/dashboard/dashboard-kit";
import { ListRowSkeleton } from "@/components/ui/skeleton";

// Shown to a learner who doesn't have access to a bank yet: the add-on(s) that sell it, bought on
// their own with no cohort. Checkout hands off to the payment gateway, which grants access on success.
export function BankPurchaseCard({ bankId }: { bankId: number }) {
  const { options, isLoading } = useBankPurchaseOptions(bankId, true);
  const checkout = useInitiateStandaloneAddons();

  const buy = (addonId: number) =>
    checkout.mutate([addonId], {
      onSuccess: (res) => {
        if (res.order_id != null) {
          try {
            sessionStorage.setItem("checkout_order_id", String(res.order_id));
          } catch {
            /* sessionStorage may be unavailable */
          }
        }
        window.location.href = res.gateway_url;
      },
      onError: (err) => toast.error(err.message),
    });

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        eyebrow="Practice"
        title="Get access to this question bank"
        subtitle="Buy access on its own — you don't need to enrol in a cohort first."
      />
      <Card title="Ways to get access">
        {isLoading ? (
          <ListRowSkeleton rows={2} />
        ) : options.length === 0 ? (
          <EmptyState>This question bank isn&apos;t for sale on its own right now. Staff can grant access.</EmptyState>
        ) : (
          <ul className="divide-y divide-gray-100">
            {options.map((o) => (
              <li key={o.addonId} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{o.addonName}</p>
                  <p className="mt-1 text-xs text-gray-500">From {o.programTitle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ${o.priceUsd}
                    {o.pricingMode !== "usd_only" && parseFloat(o.priceNgn) > 0 && ` · ₦${o.priceNgn}`}
                  </span>
                  <Button
                    type="button"
                    onClick={() => buy(o.addonId)}
                    loading={checkout.isPending}
                    className="w-auto px-5"
                  >
                    Buy access
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
