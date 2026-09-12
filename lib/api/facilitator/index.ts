// lib/api/facilitators/get-facilitator-applications.ts
import {
  ApprovedFacilitator,
  CreateFacilitatorApplicationRequest,
  CreateFacilitatorApplicationResponse,
  CreateFacilitatorProfileRequest,
  FacilitatorApplication,
  FacilitatorApplicationFilters,
  FacilitatorProfile,
  InviteFacilitatorRequest,
  PatchFacilitatorApplicationRequest,
  PatchFacilitatorProfileRequest,
} from "@/types/facilitator";
import { unwrapList, unwrapObject } from "@/types/api";
import { apiClient } from "../client";
import { toFormData, MULTIPART_HEADERS } from "../form-data";

export async function getApprovedFacilitators(): Promise<ApprovedFacilitator[]> {
  const { data } = await apiClient.get("/api/facilitators/profiles/");
  return unwrapList<ApprovedFacilitator>(data);
}

export async function getFacilitatorProfile(id: number): Promise<FacilitatorProfile> {
  const { data } = await apiClient.get(`/api/facilitators/profiles/${id}/`);
  return unwrapObject<FacilitatorProfile>(data);
}

// avatar (when present) is a real file upload, so this always goes as multipart/form-data —
// same convention as programs' cover_image.
export async function createFacilitatorProfile(
  payload: CreateFacilitatorProfileRequest,
): Promise<FacilitatorProfile> {
  const { data } = await apiClient.post(
    "/api/facilitators/profiles/",
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return unwrapObject<FacilitatorProfile>(data);
}

export async function patchFacilitatorProfile(
  id: number,
  payload: PatchFacilitatorProfileRequest,
): Promise<FacilitatorProfile> {
  const { data } = await apiClient.patch(
    `/api/facilitators/profiles/${id}/`,
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return unwrapObject<FacilitatorProfile>(data);
}

export async function deleteFacilitatorProfile(id: number): Promise<void> {
  await apiClient.delete(`/api/facilitators/profiles/${id}/`);
}

// Admin-only. Links an existing account by email if one exists, otherwise creates an inactive
// account and emails the facilitator a set-password link.
export async function inviteFacilitator(
  payload: InviteFacilitatorRequest,
): Promise<FacilitatorProfile> {
  const { data } = await apiClient.post(
    "/api/facilitators/profiles/invite/",
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return unwrapObject<FacilitatorProfile>(data);
}

// Public endpoint — no auth required. cv_file is a real file upload (PDF/Word, max 5MB), so this
// always goes as multipart/form-data.
export async function createFacilitatorApplication(
  payload: CreateFacilitatorApplicationRequest,
): Promise<CreateFacilitatorApplicationResponse> {
  const { data } = await apiClient.post(
    "/api/facilitators/applications/",
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return unwrapObject<CreateFacilitatorApplicationResponse>(data);
}

export async function getFacilitatorApplications(
  filters?: FacilitatorApplicationFilters,
): Promise<FacilitatorApplication[]> {
  const { data } = await apiClient.get("/api/facilitators/applications/manage/", {
    params: filters,
  });
  return unwrapList<FacilitatorApplication>(data);
}

export async function getFacilitatorApplication(id: number): Promise<FacilitatorApplication> {
  const { data } = await apiClient.get(`/api/facilitators/applications/manage/${id}/`);
  return unwrapObject<FacilitatorApplication>(data);
}

export async function patchFacilitatorApplication(
  id: number,
  payload: PatchFacilitatorApplicationRequest,
): Promise<FacilitatorApplication> {
  const { data } = await apiClient.patch(
    `/api/facilitators/applications/manage/${id}/`,
    payload,
  );
  return unwrapObject<FacilitatorApplication>(data);
}
