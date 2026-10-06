import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQuestionBank,
  deleteAdminQuestion,
  deleteQuestionBank,
  grantQuestionBankAccess,
  patchAdminQuestion,
  patchQuestionBank,
  startAttempt,
  submitAttempt,
  uploadQuestionBankCsv,
} from "@/lib/api/question-banks";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import type {
  AdminQuestion,
  CreateQuestionBankRequest,
  PatchQuestionBankRequest,
  PatchQuestionRequest,
  QuestionBank,
  QuestionBankAttempt,
  StartAttemptRequest,
  SubmitAttemptRequest,
} from "@/types/question-bank";

export function useCreateQuestionBank() {
  const qc = useQueryClient();
  return useMutation<QuestionBank, NormalizedError, CreateQuestionBankRequest>({
    mutationFn: createQuestionBank,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.questionBanks.all }),
  });
}

export function usePatchQuestionBank(id: number) {
  const qc = useQueryClient();
  return useMutation<QuestionBank, NormalizedError, PatchQuestionBankRequest>({
    mutationFn: (payload) => patchQuestionBank(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.all });
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.detail(id) });
    },
  });
}

export function useDeleteQuestionBank() {
  const qc = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: deleteQuestionBank,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.questionBanks.all }),
  });
}

export function useGrantQuestionBankAccess(bankId: number) {
  return useMutation<unknown, NormalizedError, number>({
    mutationFn: (userId) => grantQuestionBankAccess(bankId, { user_id: userId }),
  });
}

export function useUploadQuestionBankCsv(bankId: number) {
  const qc = useQueryClient();
  return useMutation<{ created: number }, NormalizedError, File>({
    mutationFn: (file) => uploadQuestionBankCsv(bankId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.all });
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.detail(bankId) });
    },
  });
}

export function usePatchAdminQuestion() {
  const qc = useQueryClient();
  return useMutation<AdminQuestion, NormalizedError, { id: number; payload: PatchQuestionRequest }>({
    mutationFn: ({ id, payload }) => patchAdminQuestion(id, payload),
    onSuccess: (q) => {
      qc.setQueryData(queryKeys.questionBanks.question(q.id), q);
    },
  });
}

export function useDeleteAdminQuestion() {
  const qc = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: deleteAdminQuestion,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: queryKeys.questionBanks.question(id) });
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.all });
    },
  });
}

export function useStartAttempt(bankId: number) {
  const qc = useQueryClient();
  return useMutation<QuestionBankAttempt, NormalizedError, StartAttemptRequest>({
    mutationFn: (payload) => startAttempt(bankId, payload),
    onSuccess: (attempt) => {
      qc.setQueryData(queryKeys.questionBanks.attempt(attempt.id), attempt);
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.attempts(bankId) });
    },
  });
}

export function useSubmitAttempt(attemptId: number, bankId: number) {
  const qc = useQueryClient();
  return useMutation<QuestionBankAttempt, NormalizedError, SubmitAttemptRequest>({
    mutationFn: (payload) => submitAttempt(attemptId, payload),
    onSuccess: (attempt) => {
      qc.setQueryData(queryKeys.questionBanks.attempt(attemptId), attempt);
      qc.invalidateQueries({ queryKey: queryKeys.questionBanks.attempts(bankId) });
    },
  });
}
