// lib/api/admin-users/index.ts
import { AdminUser, CreateAdminUserRequest, PatchAdminUserRequest } from "@/types/user";
import { AdminLearner } from "@/types/learner";
import { unwrapList, unwrapObject } from "@/types/api";
import { apiClient } from "../client";

export async function getAdminLearners(): Promise<AdminLearner[]> {
  const { data } = await apiClient.get("/api/auth/admin/learners/");
  return unwrapList<AdminLearner>(data);
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get("/api/auth/admin/users/");
  return unwrapList<AdminUser>(data);
}

export async function getAdminUser(id: number): Promise<AdminUser> {
  const { data } = await apiClient.get(`/api/auth/admin/users/${id}/`);
  return unwrapObject<AdminUser>(data);
}

export async function createAdminUser(payload: CreateAdminUserRequest): Promise<AdminUser> {
  const { data } = await apiClient.post("/api/auth/admin/users/", payload);
  return unwrapObject<AdminUser>(data);
}

export async function patchAdminUser(id: number, payload: PatchAdminUserRequest): Promise<AdminUser> {
  const { data } = await apiClient.patch(`/api/auth/admin/users/${id}/`, payload);
  return unwrapObject<AdminUser>(data);
}
