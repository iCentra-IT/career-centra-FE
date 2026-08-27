// lib/api/career-paths/get-career-paths.ts
import {
  CareerPath,
  CareerPathDetail,
  CareerPathProgram,
  CreateCareerPathRequest,
  UpdateCareerPathRequest,
  PatchCareerPathRequest,
} from "@/types/career-paths";
import { ApiResponse } from "@/types/api";
import { apiClient } from "../client";

// The list endpoint's "results" is itself another {success, message, data} envelope, not a bare
// array — confirmed from a real response. Genuinely double-wrapped; not a guess.
interface CareerPathsListEnvelope {
  success: boolean;
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    message: string;
    data: CareerPath[];
  };
}

export async function getCareerPaths(): Promise<CareerPath[]> {
  const { data } = await apiClient.get<CareerPathsListEnvelope>("/api/career-paths/");
  return data.results.data;
}

export async function getCareerPath(slug: string): Promise<CareerPathDetail> {
  const { data } = await apiClient.get<ApiResponse<CareerPathDetail>>(`/api/career-paths/${slug}/`);
  return data.data;
}

export async function getCareerPathPrograms(slug: string): Promise<CareerPathProgram[]> {
  const { data } = await apiClient.get<CareerPathProgram[]>(`/api/career-paths/${slug}/programs/`);
  return data;
}

export async function createCareerPath(
  payload: CreateCareerPathRequest,
): Promise<CareerPathDetail> {
  const { data } = await apiClient.post<CareerPathDetail>("/api/career-paths/", payload);
  return data;
}

export async function updateCareerPath(
  slug: string,
  payload: UpdateCareerPathRequest,
): Promise<CareerPathDetail> {
  const { data } = await apiClient.put<CareerPathDetail>(`/api/career-paths/${slug}/`, payload);
  return data;
}

export async function patchCareerPath(
  slug: string,
  payload: PatchCareerPathRequest,
): Promise<CareerPathDetail> {
  const { data } = await apiClient.patch<CareerPathDetail>(`/api/career-paths/${slug}/`, payload);
  return data;
}

export async function deleteCareerPath(slug: string): Promise<void> {
  await apiClient.delete(`/api/career-paths/${slug}/`);
}
