// lib/api/types/career-path.ts
import { ProgramFaq, ProgramListItem } from "./programs";

export interface CareerPath {
  id: number;
  title: string;
  slug: string;
  description: string;
  levels: string[]; // raw values like "foundation" — no _display variant given, capitalize for UI
  suitable_roles: string[];
  certifications: string[];
  skills: string[];
  // Confirmed present on both the create response and (presumably) the detail read — same
  // {question, answer} shape as a program's faqs, reused here rather than duplicated.
  who_should_attend: string[];
  faqs: ProgramFaq[];
  program_count: number; // list rows carry only the count; fetch the detail for the programs
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Confirmed real shape — the detail endpoint embeds full ProgramListItem objects here directly.
export interface CareerPathDetail extends CareerPath {
  programs: ProgramListItem[];
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

export interface CreateCareerPathRequest {
  title: string;
  description: string;
  programs: number[]; // program IDs
  levels: string[];
  suitable_roles: string[];
  certifications: string[];
  skills: string[];
  who_should_attend: string[];
  faqs: ProgramFaq[];
  is_active: boolean;
}

export type UpdateCareerPathRequest = CreateCareerPathRequest; // PUT
export type PatchCareerPathRequest = Partial<CreateCareerPathRequest>; // PATCH
