// lib/api/enrollments/use-enrollments.ts
import { getEnrollment, getEnrollmentReceipt, getEnrollments } from '@/lib/api/enrolment';
import { queryKeys } from '@/lib/api/query-keys';
import { useQuery } from '@tanstack/react-query';


export function useEnrollments(page?: number) {
  return useQuery({
    queryKey: queryKeys.enrollments.all({ page }),
    queryFn: () => getEnrollments({ page }),
    staleTime: 60 * 1000, // enrollment status can change (pending -> active) more frequently
  });
}

export function useEnrollment(id: number) {
  return useQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: () => getEnrollment(id),
    enabled: !!id,
  });
}

export function useEnrollmentReceipt(id: number) {
  return useQuery({
    queryKey: queryKeys.enrollments.receipt(id),
    queryFn: () => getEnrollmentReceipt(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // receipts are immutable once generated, safe to cache longer
  });
}