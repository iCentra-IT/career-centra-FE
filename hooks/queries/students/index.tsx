// lib/api/students/use-student-profile.ts
import { getProfile } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import { getPurchaseHistory, getStudentCertificates, getStudentCourses, getStudentDashboard, getStudentEnrollments, getStudentProfile, getStudentSchedule } from "@/lib/api/student";
import { useAuthStore } from "@/lib/store/authStore";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getProfile,
    enabled: !!accessToken, // don't fire until logged in
    staleTime: 5 * 60 * 1000, // 5 min — adjust based on how often user data changes
  });
}

export function useStudentProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.students.profile,
    queryFn: getStudentProfile,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

function useAuthedQuery<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>, staleTime: number) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({ queryKey, queryFn, enabled: !!accessToken, staleTime });
}

export function useStudentDashboard() {
  return useAuthedQuery(queryKeys.studentDashboard.overview, getStudentDashboard, 60 * 1000);
}

export function useStudentCourses() {
  return useAuthedQuery(queryKeys.studentDashboard.courses, getStudentCourses, 60 * 1000);
}

export function useStudentEnrollments() {
  return useAuthedQuery(queryKeys.studentDashboard.enrollments, getStudentEnrollments, 60 * 1000);
}

export function useStudentSchedule() {
  return useAuthedQuery(queryKeys.studentDashboard.schedule, getStudentSchedule, 60 * 1000);
}

export function useStudentCertificates() {
  return useAuthedQuery(queryKeys.studentDashboard.certificates, getStudentCertificates, 5 * 60 * 1000);
}

export function usePurchaseHistory() {
  return useAuthedQuery(queryKeys.studentDashboard.purchaseHistory, getPurchaseHistory, 2 * 60 * 1000);
}