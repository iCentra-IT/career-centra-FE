"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrder } from "@/hooks/queries/orders";
import { queryKeys } from "@/lib/api/query-keys";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";
import { ConfirmShell, ConfirmSpinner } from "@/components/marketing/checkout-confirm-shell";

function clearCheckoutId() {
  try {
    sessionStorage.removeItem("checkout_order_id");
  } catch {
    /* sessionStorage may be unavailable */
  }
}

export function CartOrderConfirm({
  orderId,
  status,
}: {
  orderId: number;
  status?: string;
}) {
  const queryClient = useQueryClient();
  // The gateway sends `status` on the redirect; anything other than "successful" means the buyer
  // bailed or the charge failed at the gateway — no point polling the order in that case.
  const abandoned = status != null && status !== "successful";
  const { data: order, isError } = useOrder(abandoned ? 0 : orderId);

  const settled = !!order && order.status !== "pending";
  const cleanedUp = useRef(false);
  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    if (abandoned || settled) return;
    const timer = setTimeout(() => setTookTooLong(true), 40_000);
    return () => clearTimeout(timer);
  }, [abandoned, settled]);

  useEffect(() => {
    if (cleanedUp.current) return;
    if (!abandoned && !settled) return;
    cleanedUp.current = true;

    clearCheckoutId();

    if (abandoned) {
      toast.error(status === "cancelled" ? "Payment was cancelled." : "Payment was not completed.");
      return;
    }

    // A confirmed payment drains the server cart; a stale guest cart is meaningless once signed in.
    useCartStore.getState().clear();
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.count });
    queryClient.invalidateQueries({ queryKey: ["enrollments"] });

    if (order?.status === "confirmed") {
      toast.success("Payment confirmed — you're enrolled!");
    } else {
      toast.error("Payment failed.");
    }
  }, [abandoned, settled, order, status, queryClient]);

  if (abandoned) {
    return (
      <ConfirmShell>
        <h1 className="mt-8 text-xl font-semibold text-gray-900">
          {status === "cancelled" ? "Checkout cancelled" : "Payment not completed"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Your cart is still saved. Nothing was charged.
        </p>
        <Link href="/cart" className="mt-6 w-full">
          <Button className="w-full">Back to Cart</Button>
        </Link>
      </ConfirmShell>
    );
  }

  if (isError && !order) {
    return (
      <ConfirmShell>
        <h1 className="mt-8 text-xl font-semibold text-gray-900">We couldn&apos;t find that order</h1>
        <p className="mt-2 text-sm text-gray-500">
          It may still be processing. Check your purchase history in a moment.
        </p>
        <Link href="/students/purchase-history" className="mt-6 w-full">
          <Button className="w-full">View Purchase History</Button>
        </Link>
      </ConfirmShell>
    );
  }

  if (!settled) {
    return (
      <ConfirmShell>
        <ConfirmSpinner />
        <h1 className="mt-6 text-xl font-semibold text-gray-900">
          {tookTooLong ? "Still processing…" : "Confirming your payment…"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {tookTooLong
            ? "This is taking longer than usual. You can safely check the order details."
            : "Hang tight while the payment provider confirms your order."}
        </p>
        {tookTooLong && (
          <Link href={`/orders/${orderId}`} className="mt-6 w-full">
            <Button className="w-full">View Order</Button>
          </Link>
        )}
      </ConfirmShell>
    );
  }

  const confirmed = order?.status === "confirmed";
  const itemCount = order?.items.length ?? 0;

  return (
    <ConfirmShell>
      <h1 className="mt-8 text-xl font-semibold text-gray-900">
        {confirmed ? "Payment successful" : "Payment not completed"}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        {confirmed
          ? `You're enrolled in ${itemCount} course${itemCount === 1 ? "" : "s"}.`
          : "Your payment didn't go through. Nothing was charged — you can try checking out again."}
      </p>
      <div className="mt-6 flex w-full flex-col gap-3">
        <Link href={`/orders/${orderId}`} className="w-full">
          <Button className="w-full">{confirmed ? "View Order" : "View Order Details"}</Button>
        </Link>
        <Link
          href={confirmed ? "/students/enrolments" : "/cart"}
          className="flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {confirmed ? "Go to My Enrolments" : "Back to Cart"}
        </Link>
      </div>
    </ConfirmShell>
  );
}
