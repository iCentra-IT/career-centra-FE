// lib/api/notifications/use-notifications.ts
import { getNotifications } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/authStore";
import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: getNotifications,
    enabled: !!accessToken,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
