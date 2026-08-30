// lib/api/facilitators/get-facilitator-applications.ts
import {
  FacilitatorApplication,
  FacilitatorApplicationFilters,
  PatchFacilitatorApplicationRequest,
} from "@/types/facilitator";
import { unwrapList, unwrapObject } from "@/types/api";
import { apiClient } from "../client";

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
