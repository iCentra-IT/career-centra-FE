// lib/api/programs/get-programs.ts
import {
  ProgramListItem,
  Program,
  CreateProgramRequest,
  UpdateProgramRequest,
  PatchProgramRequest,
} from "@/types/programs";
import { PaginatedResponse } from "@/types/api";
import { apiClient } from "../client";

export async function getPrograms(): Promise<PaginatedResponse<ProgramListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<ProgramListItem>>("/api/programs/");
  return data;
}

export async function getProgram(slug: string): Promise<Program> {
  const { data } = await apiClient.get<Program>(`/api/programs/${slug}/`);
  return data;
}

export async function createProgram(
  payload: CreateProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.post<Program>("/api/programs/", payload);
  return data;
}

export async function updateProgram(
  slug: string,
  payload: UpdateProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.put<Program>(
    `/api/programs/${slug}/`,
    payload,
  );
  return data;
}

export async function patchProgram(
  slug: string,
  payload: PatchProgramRequest,
): Promise<Program> {
  const { data } = await apiClient.patch<Program>(
    `/api/programs/${slug}/`,
    payload,
  );
  return data;
}

export async function deleteProgram(slug: string): Promise<void> {
  await apiClient.delete(`/api/programs/${slug}/`);
}
