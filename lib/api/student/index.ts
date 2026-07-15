// lib/api/students/get-profile.ts
import { ApiResponse } from "@/types/api";
import {
  PatchStudentProfileRequest,
  StudentProfile,
  UpdateStudentProfileRequest,
} from "@/types/student";
import { apiClient } from "../client";

export async function getStudentProfile(): Promise<StudentProfile> {
  const { data } = await apiClient.get<ApiResponse<StudentProfile>>(
    "/api/students/profile/",
  );
  return data.data;
}

export async function updateStudentProfile(
  payload: UpdateStudentProfileRequest,
): Promise<StudentProfile> {
  const { data } = await apiClient.put<ApiResponse<StudentProfile>>(
    "/api/students/profile/",
    payload,
  );
  return data.data;
}

export async function patchStudentProfile(
  payload: PatchStudentProfileRequest,
): Promise<StudentProfile> {
  const { data } = await apiClient.patch<ApiResponse<StudentProfile>>(
    "/api/students/profile/",
    payload,
  );
  return data.data;
}
