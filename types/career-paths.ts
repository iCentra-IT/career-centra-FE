// lib/api/types/career-path.ts
import { ProgramListItem, ProgramReview } from "./programs";

export interface CareerPath {
  id: number;
  title: string;
  slug: string;
  header: string;
  excerpt: string;
  description: string;
  levels: string[]; // raw values like "foundation" — no _display variant given, capitalize for UI
  suitable_roles: string[];
  certifications: string[];
  skills: string[];
  who_should_attend: string[];
  // Video-only testimonials (YouTube links) — same shape/convention as a program's `reviews`.
  video_reviews: ProgramReview[];
  // Controls display order in the career paths listing (lower first, presumably).
  order: number;
  program_count: number; // list rows carry only the count; fetch the detail for the programs
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Confirmed real shape — the detail endpoint embeds full ProgramListItem objects here directly.
export interface CareerPathDetail extends CareerPath {
  programs: ProgramListItem[];
}

// Sorts career paths by their admin-assigned display `order` (lower first) — used everywhere a
// list of career paths is rendered publicly (the career paths listing, the home page's pathways
// section), since the backend's own list response order isn't guaranteed to match it. Ties fall
// back to id so the order is stable rather than depending on Array.sort's own stability guarantees.
export function compareByOrder(a: { order: number; id: number }, b: { order: number; id: number }): number {
  return a.order - b.order || a.id - b.id;
}

export interface CareerPathProgram {
  slug: string;
  program_type: string;
  title: string;
  summary: string;
  level: string;
  accreditations: string[];
  next_cohort: string;
}

// Write-side video review shape — no id/created_at, those are server-assigned (same convention
// as a program's CreateProgramReview).
export interface CreateCareerPathVideoReview {
  video_url: string;
}

export interface CreateCareerPathRequest {
  title: string;
  header: string;
  excerpt: string;
  description: string;
  programs: number[]; // program IDs
  levels: string[];
  suitable_roles: string[];
  certifications: string[];
  skills: string[];
  who_should_attend: string[];
  video_reviews: CreateCareerPathVideoReview[];
  is_active: boolean;
  order: number;
}

export type UpdateCareerPathRequest = CreateCareerPathRequest; // PUT
export type PatchCareerPathRequest = Partial<CreateCareerPathRequest>; // PATCH
