// lib/api/admin-users/index.ts
import { AdminUser, CreateAdminUserRequest, PatchAdminUserRequest } from "@/types/user";
import { AdminLearner, LearnerExportParams, LearnerFilters } from "@/types/learner";
import { unwrapList, unwrapObject } from "@/types/api";
import { apiClient } from "../client";

export async function getAdminLearners(filters?: LearnerFilters): Promise<AdminLearner[]> {
  // Page size pinned to the pagination max — the learners page still loads the whole list and
  // filters/searches client-side rather than paginating through the UI.
  const { data } = await apiClient.get("/api/auth/admin/learners/", {
    params: { ...filters, page_size: 100 },
  });
  return unwrapList<AdminLearner>(data);
}

// Streams a CSV of whatever the list endpoint would return for these filters, or of exactly
// `ids` when the caller passed a user-made row selection.
export async function exportAdminLearners(params?: LearnerExportParams): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/api/auth/admin/learners/export/", {
    params: {
      ...params,
      ids: params?.ids?.join(","),
      columns: params?.columns?.join(","),
    },
    responseType: "blob",
  });
  return data;
}

// /api/auth/admin/users/ — confirmed real shape, scoped to staff/admin accounts (students and
// facilitators have their own surfaces: /api/auth/admin/learners/ for learners, etc.). List
// response is a bare array.
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

// Resends the invite email to a staff/admin account that hasn't accepted it yet
// (status === "pending_verification") — the link it carries goes to /staff/accept-invite.
export async function resendAdminUserInvite(id: number): Promise<void> {
  await apiClient.post(`/api/auth/admin/users/${id}/resend-invite/`);
}

// Four endpoints confirmed real and, per the backend team, usable on ANY user type (student,
// facilitator, staff-admin, admin) — not scoped to the /api/auth/admin/users/ (staff-only) or
// /api/auth/admin/learners/ (learner-only) surfaces above. Admin/staff-admin only; a staff-admin
// can't act on a fellow staff-admin or an admin at all (see canManageUser-style scoping at each
// call site), so that restriction naturally covers "staff-admin can't delete a fellow staff-admin"
// without needing separate logic here.

// CORRECTION: despite the DELETE verb and the path reading like a delete, this only deactivates
// the account (blocks login) — it does not remove it. Previously mislabeled here as a real delete.
export async function deactivateUser(id: number): Promise<void> {
  await apiClient.delete(`/api/auth/admin/all-users/${id}/`);
}

export async function reactivateUser(id: number): Promise<void> {
  await apiClient.post(`/api/auth/reactivate/${id}/`);
}

// Distinct from resendAdminUserInvite above (that one's staff-only, and its link goes to
// /staff/accept-invite) — this resends the ordinary signup email-verification link and works for
// any account still in "pending_verification".
export async function resendUserVerification(id: number): Promise<void> {
  await apiClient.post(`/api/auth/resend-verification/${id}/`);
}

// The actual permanent delete — irreversible, unlike deactivateUser above.
export async function deleteUserPermanently(id: number): Promise<void> {
  await apiClient.delete(`/api/auth/delete/${id}/`);
}
