// lib/api/notifications/get-notifications.ts
import { BroadcastNotificationRequest, Notification } from "@/types/notification";
import { unwrapList } from "@/types/api";
import { apiClient } from "../client";

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get("/api/notifications/");
  return unwrapList<Notification>(data);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/api/notifications/mark-all-read/");
}

export async function broadcastNotification(
  payload: BroadcastNotificationRequest,
): Promise<void> {
  await apiClient.post("/api/notifications/broadcast/", payload);
}
