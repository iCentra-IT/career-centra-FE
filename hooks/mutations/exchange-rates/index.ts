import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExchangeRate,
  deleteExchangeRate,
  patchExchangeRate,
} from "@/lib/api/exchange-rates";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  CreateExchangeRateRequest,
  ExchangeRate,
  PatchExchangeRateRequest,
} from "@/types/exchange-rate";

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation<ExchangeRate, NormalizedError, CreateExchangeRateRequest>({
    mutationFn: createExchangeRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exchangeRates.all });
    },
  });
}

export function usePatchExchangeRate(id: number) {
  const queryClient = useQueryClient();

  return useMutation<ExchangeRate, NormalizedError, PatchExchangeRateRequest>({
    mutationFn: (payload) => patchExchangeRate(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.exchangeRates.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.exchangeRates.all });
    },
  });
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteExchangeRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exchangeRates.all });
    },
  });
}
