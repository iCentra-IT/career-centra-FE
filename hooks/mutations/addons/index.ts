import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCohortAddonOverride,
  createProgramAddon,
  deleteCohortAddonOverride,
  deleteProgramAddon,
  patchCohortAddonOverride,
  patchProgramAddon,
} from "@/lib/api/addons";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import type {
  CohortAddonOverride,
  CohortAddonOverrideWriteRequest,
  PatchProgramAddonRequest,
  ProgramAddon,
  ProgramAddonWriteRequest,
} from "@/types/addon";

export function useCreateProgramAddon(programSlug: string) {
  const qc = useQueryClient();
  return useMutation<ProgramAddon, NormalizedError, ProgramAddonWriteRequest>({
    mutationFn: (payload) => createProgramAddon(programSlug, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.programAddons.list(programSlug) }),
  });
}

export function usePatchProgramAddon(programSlug: string) {
  const qc = useQueryClient();
  return useMutation<ProgramAddon, NormalizedError, { id: number; payload: PatchProgramAddonRequest }>({
    mutationFn: ({ id, payload }) => patchProgramAddon(programSlug, id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.programAddons.list(programSlug) }),
  });
}

export function useDeleteProgramAddon(programSlug: string) {
  const qc = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteProgramAddon(programSlug, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.programAddons.list(programSlug) }),
  });
}

export function useCreateCohortAddonOverride(cohortId: number) {
  const qc = useQueryClient();
  return useMutation<CohortAddonOverride, NormalizedError, CohortAddonOverrideWriteRequest>({
    mutationFn: (payload) => createCohortAddonOverride(cohortId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cohortAddonOverrides.list(cohortId) }),
  });
}

export function usePatchCohortAddonOverride(cohortId: number) {
  const qc = useQueryClient();
  return useMutation<CohortAddonOverride, NormalizedError, { id: number; payload: Partial<CohortAddonOverrideWriteRequest> }>({
    mutationFn: ({ id, payload }) => patchCohortAddonOverride(cohortId, id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cohortAddonOverrides.list(cohortId) }),
  });
}

export function useDeleteCohortAddonOverride(cohortId: number) {
  const qc = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteCohortAddonOverride(cohortId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cohortAddonOverrides.list(cohortId) }),
  });
}
