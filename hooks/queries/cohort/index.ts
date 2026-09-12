// lib/api/cohorts/use-cohorts.ts
import { getCohorts, getCohort, getSession, getSessions } from '@/lib/api/cohort';
import { queryKeys } from '@/lib/api/query-keys';
import { useQuery } from '@tanstack/react-query';

export function useCohorts() {
  return useQuery({
    queryKey: queryKeys.cohorts.all,
    queryFn: () => getCohorts(),
    staleTime: 2 * 60 * 1000, // seat counts change as people enroll — keep this shorter than programs
  });
}

// Cohorts scheduled for one program — used by the public program detail page's schedule table.
// /api/programs/ no longer embeds cohorts (confirmed by a runtime crash on program.cohorts), so
// this is the real source; results are still filtered client-side by program id as a safety net
// in case the backend doesn't honor the `program` query param.
export function useCohortsByProgram(programId?: number) {
  return useQuery({
    queryKey: queryKeys.cohorts.list({ program: programId }),
    queryFn: () => getCohorts({ program: programId }),
    enabled: !!programId,
    staleTime: 2 * 60 * 1000,
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