// lib/api/students/use-student-profile.ts
import { getProfile } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import { getStudentProfile } from "@/lib/api/student";
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

