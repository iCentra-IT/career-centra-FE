// lib/api/facilitators/use-patch-facilitator-application.ts
import { createFacilitatorApplication, patchFacilitatorApplication } from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  CreateFacilitatorApplicationRequest,
  CreateFacilitatorApplicationResponse,
  FacilitatorApplication,
  PatchFacilitatorApplicationRequest,
} from "@/types/facilitator";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateFacilitatorApplication() {
  return useMutation<
    CreateFacilitatorApplicationResponse,
    NormalizedError,
    CreateFacilitatorApplicationRequest
  >({
    mutationFn: createFacilitatorApplication,
  });
}

export function usePatchFacilitatorApplication(id: number) {
  const queryClient = useQueryClient();

  return useMutation<FacilitatorApplication, NormalizedError, PatchFacilitatorApplicationRequest>({
    mutationFn: (payload) => patchFacilitatorApplication(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.facilitatorApplications.detail(id), data);
      queryClient.invalidateQueries({ queryKey: ["facilitator-applications"] });
    },
  });
}
