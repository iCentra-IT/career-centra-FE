// lib/api/addons/index.ts
import { apiClient } from "../client";
import { ApiResponse, unwrapList, unwrapObject } from "@/types/api";
import type {
  CohortAddon,
  CohortAddonOverride,
  CohortAddonOverrideWriteRequest,
  PatchProgramAddonRequest,
  ProgramAddon,
  ProgramAddonWriteRequest,
} from "@/types/addon";

// ------------------------------------------------------------------ program add-ons

export async function getProgramAddons(programSlug: string): Promise<ProgramAddon[]> {
  const { data } = await apiClient.get<ApiResponse<ProgramAddon[]> | ProgramAddon[]>(
    `/api/programs/${programSlug}/addons/`,
  );
  return unwrapList<ProgramAddon>(data);
}

// What a learner can buy for one cohort, with availability and price resolved for that run.
export async function getCohortAddons(cohortId: number): Promise<CohortAddon[]> {
  const { data } = await apiClient.get<ApiResponse<CohortAddon[]> | CohortAddon[]>(
    `/api/cohorts/${cohortId}/addons/`,
  );
  return unwrapList<CohortAddon>(data);
}

export async function createProgramAddon(programSlug: string, payload: ProgramAddonWriteRequest): Promise<ProgramAddon> {
  const { data } = await apiClient.post<ApiResponse<ProgramAddon>>(`/api/programs/${programSlug}/addons/`, payload);
  return unwrapObject<ProgramAddon>(data);
}

export async function patchProgramAddon(
  programSlug: string,
  id: number,
  payload: PatchProgramAddonRequest,
): Promise<ProgramAddon> {
  const { data } = await apiClient.patch<ApiResponse<ProgramAddon>>(
    `/api/programs/${programSlug}/addons/${id}/`,
    payload,
  );
  return unwrapObject<ProgramAddon>(data);
}

export async function deleteProgramAddon(programSlug: string, id: number): Promise<void> {
  await apiClient.delete(`/api/programs/${programSlug}/addons/${id}/`);
}

// ------------------------------------------------------------- cohort add-on overrides

// Admin/staff only. No override row means the add-on sells at the program's listed price.
export async function getCohortAddonOverrides(cohortId: number): Promise<CohortAddonOverride[]> {
  const { data } = await apiClient.get<ApiResponse<CohortAddonOverride[]> | CohortAddonOverride[]>(
    `/api/cohorts/${cohortId}/addon-overrides/`,
  );
  return unwrapList<CohortAddonOverride>(data);
}

export async function createCohortAddonOverride(
  cohortId: number,
  payload: CohortAddonOverrideWriteRequest,
): Promise<CohortAddonOverride> {
  const { data } = await apiClient.post<ApiResponse<CohortAddonOverride>>(
    `/api/cohorts/${cohortId}/addon-overrides/`,
    payload,
  );
  return unwrapObject<CohortAddonOverride>(data);
}

export async function patchCohortAddonOverride(
  cohortId: number,
  id: number,
  payload: Partial<CohortAddonOverrideWriteRequest>,
): Promise<CohortAddonOverride> {
  const { data } = await apiClient.patch<ApiResponse<CohortAddonOverride>>(
    `/api/cohorts/${cohortId}/addon-overrides/${id}/`,
    payload,
  );
  return unwrapObject<CohortAddonOverride>(data);
}

export async function deleteCohortAddonOverride(cohortId: number, id: number): Promise<void> {
  await apiClient.delete(`/api/cohorts/${cohortId}/addon-overrides/${id}/`);
}
