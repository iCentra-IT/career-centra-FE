// lib/api/cohorts/use-cohorts.ts
import { getCohorts, getCohort, getSession, getSessions } from '@/lib/api/cohort';
import { queryKeys } from '@/lib/api/query-keys';
import { useQuery } from '@tanstack/react-query';

export function useCohorts() {
  return useQuery({
    queryKey: queryKeys.cohorts.all,
    queryFn: getCohorts,
    staleTime: 2 * 60 * 1000, // seat counts change as people enroll — keep this shorter than programs
  });
}

export function useCohort(id: number) {
  return useQuery({
    queryKey: queryKeys.cohorts.detail(id),
    queryFn: () => getCohort(id),
    enabled: !!id,
  });
}

export function useSessions(cohortId: number) {
  return useQuery({
    queryKey: queryKeys.cohorts.sessions(cohortId),
    queryFn: () => getSessions(cohortId),
    enabled: !!cohortId,
  });
}

export function useSession(cohortId: number, id: number) {
  return useQuery({
    queryKey: queryKeys.cohorts.sessionDetail(cohortId, id),
    queryFn: () => getSession(cohortId, id),
    enabled: !!cohortId && !!id,
  });
}