// lib/api/types/notification.ts

export interface Notification {
  id: number;
  notification_type: "enrollment_confirmed" | string;
  notification_type_display: string;
  title: string;
  body: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
}

export interface BroadcastNotificationRequest {
  notification_type: Notification["notification_type"];
  title: string;
  body: string;
  action_url: string;
  role: "student" | "facilitator" | "staff-admin" | "admin" | string;
}
