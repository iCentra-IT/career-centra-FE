// lib/api/facilitators/use-facilitator-applications.ts
import { getFacilitatorApplication, getFacilitatorApplications } from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { FacilitatorApplicationFilters } from "@/types/facilitator";
import { useQuery } from "@tanstack/react-query";

export function useFacilitatorApplications(filters?: FacilitatorApplicationFilters) {
  return useQuery({
    queryKey: queryKeys.facilitatorApplications.all(filters),
    queryFn: () => getFacilitatorApplications(filters),
    staleTime: 60 * 1000,
  });
}

export function useFacilitatorApplication(id: number) {
  return useQuery({
    queryKey: queryKeys.facilitatorApplications.detail(id),
    queryFn: () => getFacilitatorApplication(id),
    enabled: !!id,
  });
}
