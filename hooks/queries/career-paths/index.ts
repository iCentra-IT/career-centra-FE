// lib/api/career-paths/use-career-paths.ts
import { getCareerPath, getCareerPathPrograms, getCareerPaths } from "@/lib/api/career-paths";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useCareerPaths() {
  return useQuery({
    queryKey: queryKeys.careerPaths.all,
    queryFn: getCareerPaths,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCareerPath(slug: string) {
  return useQuery({
    queryKey: queryKeys.careerPaths.detail(slug),
    queryFn: () => getCareerPath(slug),
    enabled: !!slug,
  });
}

export function useCareerPathPrograms(slug: string) {
  return useQuery({
    queryKey: queryKeys.careerPaths.programs(slug),
    queryFn: () => getCareerPathPrograms(slug),
    enabled: !!slug,
  });
}
