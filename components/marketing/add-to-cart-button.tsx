"use client";

import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore, type CartItem } from "@/lib/store/cartStore";
import { useCart } from "@/hooks/queries/cart";
import { useAddToCart } from "@/hooks/mutations/cart";

export function AddToCartButton({
  item,
  className,
}: {
  item: CartItem;
  className?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const guestItems = useCartStore((s) => s.items);
  const addGuestItem = useCartStore((s) => s.addItem);
  const { data: cart } = useCart();
  const addToCart = useAddToCart();

  const inCart = user
    ? !!cart?.items.some((line) => line.cohort.id === item.cohortId)
    : guestItems.some((i) => i.cohortId === item.cohortId);

  const handleClick = () => {
    if (inCart) return;

    if (user) {
      addToCart.mutate(
        { cohort_id: item.cohortId },
        {
          onSuccess: () => toast.success("Added to cart."),
          onError: (err) => toast.error(err.message),
        },
      );
      return;
    }

    addGuestItem(item);
    toast.success("Added to cart.");
  };

  const busy = addToCart.isPending;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={inCart || busy}
      className={
        className ??
        "text-center text-sm font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
      }
    >
      {inCart ? "Added to Cart" : busy ? "Adding…" : "Add to Cart"}
    </button>
  );
}
