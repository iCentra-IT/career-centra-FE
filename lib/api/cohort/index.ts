// lib/api/cohorts/get-cohorts.ts
import { Cohort, CohortDetail, CreateCohortRequest, UpdateCohortRequest, PatchCohortRequest, CohortSession, CreateCohortSessionRequest, PatchCohortSessionRequest, UpdateCohortSessionRequest } from '@/types/cohort';
import { apiClient } from '../client';

export async function getCohorts(): Promise<Cohort[]> {
  const { data } = await apiClient.get<Cohort[]>('/api/cohorts/');
  return data;
}

export async function getCohort(id: number): Promise<CohortDetail> {
  const { data } = await apiClient.get<CohortDetail>(`/api/cohorts/${id}/`);
  return data;
}

export async function createCohort(payload: CreateCohortRequest): Promise<CohortDetail> {
  const { data } = await apiClient.post<CohortDetail>('/api/cohorts/', payload);
  return data;
}

export async function updateCohort(
  id: number,
  payload: UpdateCohortRequest
): Promise<CohortDetail> {
  const { data } = await apiClient.put<CohortDetail>(`/api/cohorts/${id}/`, payload);
  return data;
}

export async function patchCohort(
  id: number,
  payload: PatchCohortRequest
): Promise<CohortDetail> {
  const { data } = await apiClient.patch<CohortDetail>(`/api/cohorts/${id}/`, payload);
  return data;
}

export async function deleteCohort(id: number): Promise<void> {
  await apiClient.delete(`/api/cohorts/${id}/`);
}

export async function getSessions(cohortId: number): Promise<CohortSession[]> {
  const { data } = await apiClient.get<CohortSession[]>(
    `/api/cohorts/${cohortId}/sessions/`
  );
  return data;
}

export async function getSession(cohortId: number, id: number): Promise<CohortSession> {
  const { data } = await apiClient.get<CohortSession>(
    `/api/cohorts/${cohortId}/sessions/${id}/`
  );
  return data;
}

export async function createSession(
  cohortId: number,
  payload: CreateCohortSessionRequest
): Promise<CohortSession> {
  const { data } = await apiClient.post<CohortSession>(
    `/api/cohorts/${cohortId}/sessions/`,
    payload
  );
  return data;
}

export async function updateSession(
  cohortId: number,
  id: number,
  payload: UpdateCohortSessionRequest
): Promise<CohortSession> {
  const { data } = await apiClient.put<CohortSession>(
    `/api/cohorts/${cohortId}/sessions/${id}/`,
    payload
  );
  return data;
}

export async function patchSession(
  cohortId: number,
  id: number,
  payload: PatchCohortSessionRequest
): Promise<CohortSession> {
  const { data } = await apiClient.patch<CohortSession>(
    `/api/cohorts/${cohortId}/sessions/${id}/`,
    payload
  );
  return data;
}

export async function deleteSession(cohortId: number, id: number): Promise<void> {
  await apiClient.delete(`/api/cohorts/${cohortId}/sessions/${id}/`);
}