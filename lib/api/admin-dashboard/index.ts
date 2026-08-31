import { AdminDashboard } from "@/types/admin-dashboard";
import { unwrapObject } from "@/types/api";
import { apiClient } from "../client";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await apiClient.get("/api/admin/dashboard/");
  return unwrapObject<AdminDashboard>(data);
}
