import { useQuery } from "@tanstack/react-query";
import { getCohortAddonOverrides, getCohortAddons, getProgramAddons } from "@/lib/api/addons";
import { queryKeys } from "@/lib/api/query-keys";

export function useProgramAddons(programSlug: string) {
  return useQuery({
    queryKey: queryKeys.programAddons.list(programSlug),
    queryFn: () => getProgramAddons(programSlug),
    enabled: !!programSlug,
  });
}

export function useCohortAddonOverrides(cohortId: number) {
  return useQuery({
    queryKey: queryKeys.cohortAddonOverrides.list(cohortId),
    queryFn: () => getCohortAddonOverrides(cohortId),
    enabled: !!cohortId,
  });
}

export function useCohortAddons(cohortId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.cohortAddons.list(cohortId ?? 0),
    queryFn: () => getCohortAddons(cohortId as number),
    enabled: !!cohortId,
  });
}
