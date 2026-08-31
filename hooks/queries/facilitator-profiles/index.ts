import { getApprovedFacilitators } from "@/lib/api/facilitator";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useApprovedFacilitators() {
  return useQuery({
    queryKey: queryKeys.facilitatorProfiles.all,
    queryFn: getApprovedFacilitators,
    staleTime: 5 * 60 * 1000,
  });
}
