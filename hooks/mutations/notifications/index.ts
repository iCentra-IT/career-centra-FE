// lib/api/notifications/use-mark-all-read.ts
import { broadcastNotification, markAllNotificationsRead } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import { BroadcastNotificationRequest } from "@/types/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, void>({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useBroadcastNotification() {
  return useMutation<void, NormalizedError, BroadcastNotificationRequest>({
    mutationFn: broadcastNotification,
  });
}
