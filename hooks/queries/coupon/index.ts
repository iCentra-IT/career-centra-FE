// lib/api/coupons/use-coupons.ts
import { getCoupon, getCoupons } from "@/lib/api/coupon";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons.adminAll,
    queryFn: getCoupons,
    staleTime: 2 * 60 * 1000, // shorter than programs — uses_count changes more often
  });
}

export function useCoupon(id: number) {
  return useQuery({
    queryKey: queryKeys.coupons.adminDetail(id),
    queryFn: () => getCoupon(id),
    enabled: !!id,
  });
}
