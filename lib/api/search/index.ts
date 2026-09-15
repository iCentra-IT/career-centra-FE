// lib/api/search/search.ts
import { SearchResponse } from "@/types/search";
import { unwrapObject } from "@/types/api";
import { apiClient } from "../client";

// Wrapped in the standard {success, message, data} envelope — confirmed by a live capture (the
// Swagger doc's sample response omitted the envelope, same trap as career-paths pagination).
export async function search(query: string): Promise<SearchResponse> {
  const { data } = await apiClient.get("/api/search/", {
    params: { q: query },
  });
  return unwrapObject<SearchResponse>(data);
}
