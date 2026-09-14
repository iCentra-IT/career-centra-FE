import {
  getFacilitatorDashboard,
  getFacilitatorProgramDetail,
  getFacilitatorPrograms,
} from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useFacilitatorDashboard() {
  return useQuery({
    queryKey: queryKeys.facilitatorDashboard.overview,
    queryFn: getFacilitatorDashboard,
    staleTime: 60 * 1000,
  });
}

export function useFacilitatorPrograms() {
  return useQuery({
    queryKey: queryKeys.facilitatorDashboard.programs,
    queryFn: getFacilitatorPrograms,
    staleTime: 60 * 1000,
  });
}

export function useFacilitatorProgramDetail(cohortId: number) {
  return useQuery({
    queryKey: queryKeys.facilitatorDashboard.programDetail(cohortId),
    queryFn: () => getFacilitatorProgramDetail(cohortId),
    enabled: !!cohortId,
  });
}
