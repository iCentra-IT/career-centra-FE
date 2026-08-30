import { getAdminUser, getAdminUsers } from "@/lib/api/admin-users";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers.all,
    queryFn: getAdminUsers,
    staleTime: 60 * 1000,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: queryKeys.adminUsers.detail(id),
    queryFn: () => getAdminUser(id),
    enabled: !!id,
  });
}
