// lib/api/students/get-profile.ts
import { ApiResponse } from "@/types/api";
import {
  CertificatesResponse,
  PatchStudentProfileRequest,
  StudentCoursesResponse,
  StudentDashboardResponse,
  StudentProfile,
  StudentScheduleResponse,
  UpdateStudentProfileRequest,
} from "@/types/student";
import { apiClient } from "../client";
import { StudentEnrollmentsResponse } from "@/types/enrollment";
import { PurchaseHistoryResponse } from "@/types/history";

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

export async function getStudentDashboard(): Promise<StudentDashboardResponse> {
  const { data } = await apiClient.get<StudentDashboardResponse>('/api/students/dashboard/');
  return data;
}

export async function getStudentCourses(): Promise<StudentCoursesResponse> {
  const { data } = await apiClient.get<StudentCoursesResponse>('/api/students/courses/');
  return data;
}

export async function getStudentEnrollments(): Promise<StudentEnrollmentsResponse> {
  const { data } = await apiClient.get<StudentEnrollmentsResponse>('/api/students/enrollments/');
  return data;
}

export async function getStudentSchedule(): Promise<StudentScheduleResponse> {
  const { data } = await apiClient.get<StudentScheduleResponse>('/api/students/schedule/');
  return data;
}

export async function getStudentCertificates(): Promise<CertificatesResponse> {
  const { data } = await apiClient.get<CertificatesResponse>('/api/students/certificates/');
  return data;
}

export async function getPurchaseHistory(): Promise<PurchaseHistoryResponse> {
  const { data } = await apiClient.get<PurchaseHistoryResponse>('/api/students/purchase-history/');
  return data;
}