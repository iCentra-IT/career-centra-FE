// lib/api/search/use-search.ts
import { search } from "@/lib/api/search";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search.query(query),
    queryFn: () => search(query),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
  });
}
