// lib/api/enrollments/use-admin-enrollments.ts
import { getAdminEnrollments } from "@/lib/api/enrolment";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAdminEnrollments(page?: number) {
  return useQuery({
    queryKey: queryKeys.adminEnrollments.all({ page }),
    queryFn: () => getAdminEnrollments({ page }),
    staleTime: 60 * 1000,
  });
}
