import {
  getApprovedFacilitators,
  getFacilitatorProfile,
  getMyFacilitatorProfile,
} from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useApprovedFacilitators() {
  return useQuery({
    queryKey: queryKeys.facilitatorProfiles.all,
    queryFn: getApprovedFacilitators,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacilitatorProfile(id: number) {
  return useQuery({
    queryKey: queryKeys.facilitatorProfiles.detail(id),
    queryFn: () => getFacilitatorProfile(id),
    enabled: !!id,
  });
}

export function useMyFacilitatorProfile() {
  return useQuery({
    queryKey: queryKeys.facilitatorProfiles.me,
    queryFn: getMyFacilitatorProfile,
  });
}
