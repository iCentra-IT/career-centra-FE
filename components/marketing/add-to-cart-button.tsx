"use client";

import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore, type CartItem } from "@/lib/store/cartStore";

export function AddToCartButton({
  item,
  className,
}: {
  item: CartItem;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const inCart = items.some((i) => i.programId === item.programId);

  const handleClick = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (inCart) return;
    addItem(item);
    toast.success("Added to cart.");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={inCart}
      className={className ?? "text-center text-sm font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"}
    >
      {inCart ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
