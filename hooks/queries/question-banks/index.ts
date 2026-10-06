import { useQuery } from "@tanstack/react-query";
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
