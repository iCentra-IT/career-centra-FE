// lib/api/types/search.ts

// Confirmed by a live capture of GET /api/search/ — two things the Swagger doc's placeholder
// sample ("programs": ["string"]) got wrong: the payload is wrapped in the usual {success,
// message, data} envelope (see unwrapObject in lib/api/search/index.ts), and each match is a real
// object (id/title/slug/summary/level), not a bare title string — so results can link straight to
// their program/career-path page without cross-referencing a separately-loaded list.
export interface SearchProgramResult {
  id: number;
  title: string;
  slug: string;
  summary: string;
  level_display: string;
}

export interface SearchCareerPathResult {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
}

export interface SearchResponse {
  programs: SearchProgramResult[];
  career_paths: SearchCareerPathResult[];
}
