import { useQuery } from "@tanstack/react-query";
import { getCart, getCartCount } from "@/lib/api/cart";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/authStore";

// The server cart only exists for authenticated users — guests keep a local cart
// (see useGuestCartStore) that is merged in on login.
export function useCart(opts?: { currency?: string; coupon?: string }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const params = {
    ...(opts?.currency ? { currency: opts.currency } : {}),
    ...(opts?.coupon ? { coupon: opts.coupon } : {}),
  };

  return useQuery({
    queryKey: queryKeys.cart.view(params),
    queryFn: () => getCart(params),
    enabled: !!accessToken,
    staleTime: 30 * 1000,
  });
}

export function useCartCount() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.cart.count,
    queryFn: getCartCount,
    enabled: !!accessToken,
    staleTime: 30 * 1000,
  });
}
