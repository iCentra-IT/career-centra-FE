import { getAdminDashboard } from "@/lib/api/admin-dashboard";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: getAdminDashboard,
    staleTime: 60 * 1000,
  });
}
