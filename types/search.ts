// lib/api/types/search.ts

// Confirmed shape returns titles only (no slugs) — the frontend cross-references these against
// the already-loaded programs/career-paths lists to build real links.
export interface SearchResponse {
  programs: string[];
  career_paths: string[];
}
