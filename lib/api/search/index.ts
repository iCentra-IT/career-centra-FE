// lib/api/search/search.ts
import { SearchResponse } from "@/types/search";
import { apiClient } from "../client";

export async function search(query: string): Promise<SearchResponse> {
  const { data } = await apiClient.get<SearchResponse>("/api/search/", {
    params: { q: query },
  });
  return data;
}
