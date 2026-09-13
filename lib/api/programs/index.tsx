// lib/api/programs/get-programs.ts
import {
  Program,
  CreateProgramRequest,
  UpdateProgramRequest,
  PatchProgramRequest,
  ProgramListFilters,
  PublicProgramListing,
} from "@/types/programs";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { apiClient } from "../client";
import { toRequestBody } from "../form-data";

// Confirmed query params: search, program_type, level, audience, certification_body, price_min,
// price_max — all optional, filtering the public catalog listing server-side.
export async function getPrograms(
  filters?: ProgramListFilters,
): Promise<PaginatedResponse<PublicProgramListing>> {
  const { data } = await apiClient.get<PaginatedResponse<PublicProgramListing>>("/api/programs/", {
    params: filters,
  });
  return data;
}

export async function getProgram(slug: string): Promise<Program> {
  const { data } = await apiClient.get<ApiResponse<Program>>(`/api/programs/${slug}/`);
  return data.data;
}

// Plain JSON when there's no cover_image File to upload (confirmed by a real sample payload from
// the backend dev), multipart with the bracket-notation nested encoding when there is one
// (confirmed separately by "not a file, check the encoding type on the form" — see
// lib/api/form-data.ts's toRequestBody for the full story).
export async function createProgram(
  payload: CreateProgramRequest,
): Promise<Program> {
  const { body, headers } = toRequestBody(payload);
  const { data } = await apiClient.post<ApiResponse<Program>>(
    "/api/programs/",
    body,
    headers ? { headers } : undefined,
  );
  return data.data;
}

export async function updateProgram(
  slug: string,
  payload: UpdateProgramRequest,
): Promise<Program> {
  const { body, headers } = toRequestBody(payload);
  const { data } = await apiClient.put<ApiResponse<Program>>(
    `/api/programs/${slug}/`,
    body,
    headers ? { headers } : undefined,
  );
  return data.data;
}

export async function patchProgram(
  slug: string,
  payload: PatchProgramRequest,
): Promise<Program> {
  const { body, headers } = toRequestBody(payload);
  const { data } = await apiClient.patch<ApiResponse<Program>>(
    `/api/programs/${slug}/`,
    body,
    headers ? { headers } : undefined,
  );
  return data.data;
}

export async function deleteProgram(slug: string): Promise<void> {
  await apiClient.delete(`/api/programs/${slug}/`);
}
