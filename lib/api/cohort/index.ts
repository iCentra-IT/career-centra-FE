// lib/api/cohorts/get-cohorts.ts
import { Cohort, CohortDetail, CreateCohortRequest, UpdateCohortRequest, PatchCohortRequest, CohortSession, CreateCohortSessionRequest, PatchCohortSessionRequest, UpdateCohortSessionRequest } from '@/types/cohort';
import { ApiResponse, PaginatedResponse, unwrapObject } from '@/types/api';
import { apiClient } from '../client';

// NOTE: assumed paginated like /api/programs/ (confirmed) — same {success, count, results} envelope.
// Not yet confirmed against a real /api/cohorts/ response; fix this if that turns out wrong.
//
// `program` is an optional, unconfirmed filter param (mirrors the pattern GET /api/programs/ uses
// for its own filters) — callers that need "cohorts for this program" should still filter the
// results client-side by `cohort.program.id`, since it's not guaranteed the backend honors this.
// `page` mirrors /api/programs/'s confirmed DRF PageNumberPagination — not independently confirmed
// on this endpoint yet, but the same pagination envelope strongly suggests it works the same way.
export async function getCohorts(filters?: { program?: number; page?: number }): Promise<PaginatedResponse<Cohort>> {
  const { data } = await apiClient.get<PaginatedResponse<Cohort>>('/api/cohorts/', { params: filters });
  return data;
}

export async function getCohort(id: number): Promise<CohortDetail> {
  const { data } = await apiClient.get<ApiResponse<CohortDetail>>(`/api/cohorts/${id}/`);
  return data.data;
}

export async function createCohort(payload: CreateCohortRequest): Promise<CohortDetail> {
  const { data } = await apiClient.post<ApiResponse<CohortDetail>>('/api/cohorts/', payload);
  return data.data;
}

export async function updateCohort(
  id: number,
  payload: UpdateCohortRequest
): Promise<CohortDetail> {
  const { data } = await apiClient.put<ApiResponse<CohortDetail>>(`/api/cohorts/${id}/`, payload);
  return data.data;
}

export async function patchCohort(
  id: number,
  payload: PatchCohortRequest
): Promise<CohortDetail> {
  const { data } = await apiClient.patch<ApiResponse<CohortDetail>>(`/api/cohorts/${id}/`, payload);
  return data.data;
}

export async function deleteCohort(id: number): Promise<void> {
  await apiClient.delete(`/api/cohorts/${id}/`);
}

// Confirmed real shape by a live capture — paginated like every other list endpoint in this app
// ({success, count, total_pages, results}), not the bare array previously assumed here (that
// assumption crashed the sessions UI with "is not iterable" the first time it ran against real
// data). Flattened to a plain array since nothing here paginates a cohort's sessions.
export async function getSessions(cohortId: number): Promise<CohortSession[]> {
  const { data } = await apiClient.get<PaginatedResponse<CohortSession>>(
    `/api/cohorts/${cohortId}/sessions/`
  );
  return data.results;
}

export async function getSession(cohortId: number, id: number): Promise<CohortSession> {
  const { data } = await apiClient.get(
    `/api/cohorts/${cohortId}/sessions/${id}/`
  );
  return unwrapObject<CohortSession>(data);
}

export async function createSession(
  cohortId: number,
  payload: CreateCohortSessionRequest
): Promise<CohortSession> {
  const { data } = await apiClient.post(
    `/api/cohorts/${cohortId}/sessions/`,
    payload
  );
  return unwrapObject<CohortSession>(data);
}

export async function updateSession(
  cohortId: number,
  id: number,
  payload: UpdateCohortSessionRequest
): Promise<CohortSession> {
  const { data } = await apiClient.put(
    `/api/cohorts/${cohortId}/sessions/${id}/`,
    payload
  );
  return unwrapObject<CohortSession>(data);
}

export async function patchSession(
  cohortId: number,
  id: number,
  payload: PatchCohortSessionRequest
): Promise<CohortSession> {
  const { data } = await apiClient.patch(
    `/api/cohorts/${cohortId}/sessions/${id}/`,
    payload
  );
  return unwrapObject<CohortSession>(data);
}

export async function deleteSession(cohortId: number, id: number): Promise<void> {
  await apiClient.delete(`/api/cohorts/${cohortId}/sessions/${id}/`);
}