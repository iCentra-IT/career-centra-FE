import { useQuery } from "@tanstack/react-query";
import { getExchangeRate, getExchangeRates } from "@/lib/api/exchange-rates";
import { queryKeys } from "@/lib/api/query-keys";

export function useExchangeRates(page?: number) {
  return useQuery({
    queryKey: page ? queryKeys.exchangeRates.list({ page }) : queryKeys.exchangeRates.all,
    queryFn: () => getExchangeRates(page ? { page } : undefined),
    staleTime: 60 * 1000,
  });
}

export function useExchangeRate(id: number) {
  return useQuery({
    queryKey: queryKeys.exchangeRates.detail(id),
    queryFn: () => getExchangeRate(id),
    enabled: !!id,
  });
}
