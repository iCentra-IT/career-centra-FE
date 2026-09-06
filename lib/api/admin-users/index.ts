// lib/api/admin-users/index.ts
import { AdminUser, CreateAdminUserRequest, PatchAdminUserRequest } from "@/types/user";
import { AdminLearner } from "@/types/learner";
import { unwrapList, unwrapObject } from "@/types/api";
import { apiClient } from "../client";

export async function getAdminLearners(): Promise<AdminLearner[]> {
  const { data } = await apiClient.get("/api/auth/admin/learners/");
  return unwrapList<AdminLearner>(data);
}

// GET /admin/all-users/ — lists every user regardless of role (student, facilitator, staff-admin,
// admin), superseding /api/auth/admin/users/ for listing/viewing/reassigning. No create endpoint
// was given alongside this, so createAdminUser below still targets the original path.
export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get("/api/admin/all-users/");
  return unwrapList<AdminUser>(data);
}

export async function getAdminUser(id: number): Promise<AdminUser> {
  const { data } = await apiClient.get(`/api/admin/all-users/${id}/`);
  return unwrapObject<AdminUser>(data);
}

export async function createAdminUser(payload: CreateAdminUserRequest): Promise<AdminUser> {
  const { data } = await apiClient.post("/api/auth/admin/users/", payload);
  return unwrapObject<AdminUser>(data);
}

// PATCH /admin/all-users/<pk>/ — reassign role / deactivate any user.
export async function patchAdminUser(id: number, payload: PatchAdminUserRequest): Promise<AdminUser> {
  const { data } = await apiClient.patch(`/api/admin/all-users/${id}/`, payload);
  return unwrapObject<AdminUser>(data);
}
