// lib/api/programs/use-programs.ts
import { getProgram, getPrograms } from "@/lib/api/programs";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProgramListFilters } from "@/types/programs";
import { useQuery } from "@tanstack/react-query";

export function usePrograms(filters?: ProgramListFilters) {
  return useQuery({
    queryKey: filters ? queryKeys.programs.list(filters) : queryKeys.programs.all,
    queryFn: () => getPrograms(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgram(slug: string) {
  return useQuery({
    queryKey: queryKeys.programs.detail(slug),
    queryFn: () => getProgram(slug),
    enabled: !!slug,
  });
}
