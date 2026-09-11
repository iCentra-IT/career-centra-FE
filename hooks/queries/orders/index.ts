import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";

// While the order is still `pending` the payment gateway hasn't confirmed yet, so poll —
// but give up after ~20 attempts so a stuck order doesn't hammer the API forever.
export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: Number.isFinite(id) && id > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && status !== "pending") return false;
      return query.state.dataUpdateCount > 20 ? false : 3000;
    },
  });
}
