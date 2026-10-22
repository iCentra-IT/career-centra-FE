import { getAdminLearners } from "@/lib/api/admin-users";
import { queryKeys } from "@/lib/api/query-keys";
import { LearnerFilters } from "@/types/learner";
import { useQuery } from "@tanstack/react-query";

export function useAdminLearners(filters?: LearnerFilters) {
  return useQuery({
    queryKey: [...queryKeys.adminLearners.all, filters ?? {}],
    queryFn: () => getAdminLearners(filters),
    staleTime: 60 * 1000,
  });
}
