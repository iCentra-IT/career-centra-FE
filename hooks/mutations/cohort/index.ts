// lib/api/cohorts/use-create-cohort.ts
import { createCohort, updateCohort, patchCohort, deleteCohort, createSession, deleteSession, patchSession, updateSession } from '@/lib/api/cohort';
import { queryKeys } from '@/lib/api/query-keys';
import { NormalizedError } from '@/types/api';
import { CohortDetail, CreateCohortRequest, UpdateCohortRequest, PatchCohortRequest, CohortSession, CreateCohortSessionRequest, PatchCohortSessionRequest, UpdateCohortSessionRequest } from '@/types/cohort';
import { useMutation, useQueryClient } from '@tanstack/react-query';


export function useCreateCohort() {
  const queryClient = useQueryClient();

  return useMutation<CohortDetail, NormalizedError, CreateCohortRequest>({
    mutationFn: createCohort,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.all });
    },
  });
}

export function useUpdateCohort(id: number) {
  const queryClient = useQueryClient();

  return useMutation<CohortDetail, NormalizedError, UpdateCohortRequest>({
    mutationFn: (payload) => updateCohort(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cohorts.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.all });
    },
  });
}

export function usePatchCohort(id: number) {
  const queryClient = useQueryClient();

  return useMutation<CohortDetail, NormalizedError, PatchCohortRequest>({
    mutationFn: (payload) => patchCohort(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cohorts.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.all });
    },
  });
}

export function useDeleteCohort() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteCohort(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.all });
    },
  });
}

export function useCreateSession(cohortId: number) {
  const queryClient = useQueryClient();

  return useMutation<CohortSession, NormalizedError, CreateCohortSessionRequest>({
    mutationFn: (payload) => createSession(cohortId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.sessions(cohortId) });
      // also invalidate cohort detail since it embeds "sessions" in its response
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.detail(cohortId) });
    },
  });
}

export function useUpdateSession(cohortId: number, id: number) {
  const queryClient = useQueryClient();

  return useMutation<CohortSession, NormalizedError, UpdateCohortSessionRequest>({
    mutationFn: (payload) => updateSession(cohortId, id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cohorts.sessionDetail(cohortId, id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.sessions(cohortId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.detail(cohortId) });
    },
  });
}

export function usePatchSession(cohortId: number, id: number) {
  const queryClient = useQueryClient();

  return useMutation<CohortSession, NormalizedError, PatchCohortSessionRequest>({
    mutationFn: (payload) => patchSession(cohortId, id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cohorts.sessionDetail(cohortId, id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.sessions(cohortId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.detail(cohortId) });
    },
  });
}

export function useDeleteSession(cohortId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteSession(cohortId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.sessions(cohortId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts.detail(cohortId) });
    },
  });
}