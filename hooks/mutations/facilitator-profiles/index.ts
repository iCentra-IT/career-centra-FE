import {
  createFacilitatorProfile,
  deleteFacilitatorProfile,
  inviteFacilitator,
  patchFacilitatorProfile,
} from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  CreateFacilitatorProfileRequest,
  FacilitatorProfile,
  InviteFacilitatorRequest,
  PatchFacilitatorProfileRequest,
} from "@/types/facilitator";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateFacilitatorProfile() {
  const queryClient = useQueryClient();

  return useMutation<FacilitatorProfile, NormalizedError, CreateFacilitatorProfileRequest>({
    mutationFn: createFacilitatorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.facilitatorProfiles.all });
    },
  });
}

export function useInviteFacilitator() {
  const queryClient = useQueryClient();

  return useMutation<FacilitatorProfile, NormalizedError, InviteFacilitatorRequest>({
    mutationFn: inviteFacilitator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.facilitatorProfiles.all });
    },
  });
}

export function usePatchFacilitatorProfile(id: number) {
  const queryClient = useQueryClient();

  return useMutation<FacilitatorProfile, NormalizedError, PatchFacilitatorProfileRequest>({
    mutationFn: (payload) => patchFacilitatorProfile(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.facilitatorProfiles.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.facilitatorProfiles.all });
    },
  });
}

export function useDeleteFacilitatorProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteFacilitatorProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.facilitatorProfiles.all });
    },
  });
}
