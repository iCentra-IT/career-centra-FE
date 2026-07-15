// lib/api/programs/use-programs.ts
import { getProgram, getPrograms } from "@/lib/api/programs";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function usePrograms() {
  return useQuery({
    queryKey: queryKeys.programs.all,
    queryFn: getPrograms,
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
