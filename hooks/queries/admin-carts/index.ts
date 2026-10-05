import { useQuery } from "@tanstack/react-query";
import { getAdminCarts, getAdminUserCart, getAllAdminCarts } from "@/lib/api/admin-carts";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminCarts(page: number) {
  return useQuery({
    queryKey: queryKeys.adminCarts.list(page),
    queryFn: () => getAdminCarts({ page }),
    placeholderData: (prev) => prev,
  });
}

export function useAllAdminCarts() {
  return useQuery({
    queryKey: queryKeys.adminCarts.all,
    queryFn: getAllAdminCarts,
    staleTime: 60 * 1000,
  });
}

export function useAdminUserCart(userId: number | null) {
  return useQuery({
    queryKey: queryKeys.adminCarts.user(userId ?? 0),
    queryFn: () => getAdminUserCart(userId as number),
    enabled: userId !== null,
  });
}
