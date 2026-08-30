// lib/api/programs/get-programs.ts
import {
  Program,
  CreateProgramRequest,
  UpdateProgramRequest,
  PatchProgramRequest,
  PublicProgramListing,
} from "@/types/programs";
import { ApiResponse, unwrapList } from "@/types/api";
import { apiClient } from "../client";

export async function getPrograms(): Promise<PublicProgramListing[]> {
  const { data } = await apiClient.get<PublicProgramListing[]>("/api/programs/");
  return unwrapList<PublicProgramListing>(data);
}

export async function getProgram(slug: string): Promise<Program> {
  const { data } = await apiClient.get<ApiResponse<Program>>(`/api/programs/${slug}/`);
  return data.data;
}

export async function createProgram(
  payload: CreateProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.post<ApiResponse<Program>>("/api/programs/", payload);
  return data.data;
}

export async function updateProgram(
  slug: string,
  payload: UpdateProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.put<ApiResponse<Program>>(
    `/api/programs/${slug}/`,
    payload,
  );
  return data.data;
}

export async function patchProgram(
  slug: string,
  payload: PatchProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.patch<ApiResponse<Program>>(
    `/api/programs/${slug}/`,
    payload,
  );
  return data.data;
}

export async function deleteProgram(slug: string): Promise<void> {
  await apiClient.delete(`/api/programs/${slug}/`);
}
