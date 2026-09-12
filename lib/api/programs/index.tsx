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
import { toFormData, MULTIPART_HEADERS } from "../form-data";

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

// cover_image is a real file upload (DRF ImageField), so the request has to go as
// multipart/form-data — a plain JSON body gets "not a file, check the encoding type on the form".
// Nested fields (arrays/objects — learning_outcomes, faqs, prerequisites, modules, certification)
// are encoded via the shared toFormData helper (see lib/api/form-data.ts) using the backend's
// confirmed nested-multipart convention: bracketed list indices, unbracketed dict keys.
export async function createProgram(
  payload: CreateProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.post<ApiResponse<Program>>(
    "/api/programs/",
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return data.data;
}

export async function updateProgram(
  slug: string,
  payload: UpdateProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.put<ApiResponse<Program>>(
    `/api/programs/${slug}/`,
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return data.data;
}

export async function patchProgram(
  slug: string,
  payload: PatchProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.patch<ApiResponse<Program>>(
    `/api/programs/${slug}/`,
    toFormData(payload),
    MULTIPART_HEADERS,
  );
  return data.data;
}

export async function deleteProgram(slug: string): Promise<void> {
  await apiClient.delete(`/api/programs/${slug}/`);
}
