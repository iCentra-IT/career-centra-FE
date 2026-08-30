import { getAdminLearners } from "@/lib/api/admin-users";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAdminLearners() {
  return useQuery({
    queryKey: queryKeys.adminLearners.all,
    queryFn: getAdminLearners,
    staleTime: 60 * 1000,
  });
}
