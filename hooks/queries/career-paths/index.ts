// lib/api/career-paths/use-career-paths.ts
import { getCareerPath, getCareerPathPrograms, getCareerPaths } from "@/lib/api/career-paths";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueries, useQuery } from "@tanstack/react-query";

export function useCareerPaths(page?: number) {
  return useQuery({
    queryKey: page ? queryKeys.careerPaths.list({ page }) : queryKeys.careerPaths.all,
    queryFn: () => getCareerPaths(page ? { page } : undefined),
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

// Programs aren't tagged with their career path on the program payload, and the career-paths list
// only carries a program_count — so we resolve it by fanning out one detail request per published
// path (only a handful) and finding the one whose program list contains this slug. React-query
// dedupes/caches each detail against the same key the career-path pages already use.
export function useRelatedPathPrograms(programSlug: string) {
  const { data: pathsData } = useCareerPaths();
  const paths = pathsData?.results;

  const details = useQueries({
    queries: (paths ?? []).map((path) => ({
      queryKey: queryKeys.careerPaths.detail(path.slug),
      queryFn: () => getCareerPath(path.slug),
      enabled: !!programSlug && (paths?.length ?? 0) > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = details.length === 0 || details.some((d) => d.isLoading);
  const path = details.find((d) =>
    d.data?.programs?.some((program) => program.slug === programSlug),
  )?.data;
  const related =
    path?.programs?.filter((program) => program.slug !== programSlug) ?? [];

  return { path, related, isLoading };
}
