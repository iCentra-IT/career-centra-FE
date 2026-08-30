// lib/api/facilitators/use-patch-facilitator-application.ts
import { patchFacilitatorApplication } from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import { FacilitatorApplication, PatchFacilitatorApplicationRequest } from "@/types/facilitator";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
