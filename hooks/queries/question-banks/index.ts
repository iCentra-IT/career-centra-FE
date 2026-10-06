import { useQueries, useQuery } from "@tanstack/react-query";
import { getPrograms } from "@/lib/api/programs";
import { getProgramAddons } from "@/lib/api/addons";
import {
  getAdminQuestion,
  getAdminQuestions,
  getAttempt,
  getMyAttempts,
  getMyQuestionBanks,
  getQuestionBank,
  getQuestionBanks,
} from "@/lib/api/question-banks";
import { queryKeys } from "@/lib/api/query-keys";

export function useQuestionBanks() {
  return useQuery({ queryKey: queryKeys.questionBanks.all, queryFn: getQuestionBanks });
}

export function useQuestionBank(id: number) {
  return useQuery({
    queryKey: queryKeys.questionBanks.detail(id),
    queryFn: () => getQuestionBank(id),
    enabled: !!id,
  });
}

export function useAdminQuestion(id: number | null) {
  return useQuery({
    queryKey: queryKeys.questionBanks.question(id ?? 0),
    queryFn: () => getAdminQuestion(id as number),
    enabled: id !== null && id > 0,
  });
}

export function useMyAttempts(bankId: number) {
  return useQuery({
    queryKey: queryKeys.questionBanks.attempts(bankId),
    queryFn: () => getMyAttempts(bankId),
    enabled: !!bankId,
  });
}

export function useAttempt(attemptId: number) {
  return useQuery({
    queryKey: queryKeys.questionBanks.attempt(attemptId),
    queryFn: () => getAttempt(attemptId),
    enabled: !!attemptId,
  });
}

export function useAdminQuestions(bankId: number) {
  return useQuery({
    queryKey: queryKeys.questionBanks.questions(bankId),
    queryFn: () => getAdminQuestions(bankId),
    enabled: !!bankId,
  });
}

export function useMyQuestionBanks() {
  return useQuery({ queryKey: queryKeys.questionBanks.mine, queryFn: getMyQuestionBanks });
}

export interface BankPurchaseOption {
  addonId: number;
  addonName: string;
  programSlug: string;
  programTitle: string;
  priceUsd: string;
  priceNgn: string;
  pricingMode: string;
}

// Finds the add-on that sells a bank: every program's add-ons that point at this bank id. The API
// has no "which add-on unlocks bank X" lookup, so this scans the catalogue once and caches it.
export function useBankPurchaseOptions(bankId: number, enabled: boolean) {
  const { data: programs } = useQuery({
    queryKey: ["question-banks", "purchase-scan", "programs"],
    queryFn: () => getPrograms({ page_size: 100 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const list = programs?.results ?? [];
  const addonQueries = useQueries({
    queries: list.map((p) => ({
      queryKey: queryKeys.programAddons.list(p.slug),
      queryFn: () => getProgramAddons(p.slug),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const options: BankPurchaseOption[] = [];
  addonQueries.forEach((q, i) => {
    const program = list[i];
    (q.data ?? []).forEach((a) => {
      if (a.kind === "question_bank" && a.question_bank === bankId && a.is_active) {
        options.push({
          addonId: a.id,
          addonName: a.name,
          programSlug: program.slug,
          programTitle: program.title,
          priceUsd: a.price_usd,
          priceNgn: a.price_ngn,
          pricingMode: a.pricing_mode,
        });
      }
    });
  });

  return { options, isLoading: addonQueries.some((q) => q.isLoading) };
}
