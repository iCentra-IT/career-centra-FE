// lib/api/types/program.ts
import { ProgramAccreditation } from "./student";

// Free-text category, not an enum — confirmed values so far: "Agile, Product & Business Analysis",
// "Project & Portfolio Management", "Workforce Capability"
export type ProgramType = string;

export type ProgramLevel = 'foundation' | 'professional' | 'advanced' | string;

export type ProgramAudience = 'individual' | 'corporate' | string;

export type PurchaseMode = 'direct' | 'quote' | string;

// List view — lighter payload, no "outline"
export interface ProgramListItem {
  id: number;
  title: string;
  slug: string;
  code: string;
  program_type: ProgramType;
  level: ProgramLevel;
  level_display: string;
  audience: ProgramAudience;
  audience_display: string;
  platform: string; // e.g. "careercentra"
  platform_display: string; // e.g. "careercentra.icentra.com"
  purchase_mode: PurchaseMode;
  purchase_mode_display: string;
  summary: string;
  base_price_usd: string; // decimal serialized as string — DO NOT parseFloat for display, keep as string until formatting
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  accreditations: ProgramAccreditation[];
  cover_image_url: string;
  next_cohort: string | null; // pre-formatted display date, e.g. "25 Sep 2026", or null if none scheduled
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramPrerequisite {
  id: number;
  kind: "required" | "recommended" | string;
  text: string;
  order: number;
}

export interface ProgramModuleLesson {
  id: number;
  title: string;
  order: number;
}

export interface ProgramModule {
  id: number;
  title: string;
  order: number;
  lesson_count: number;
  lessons: ProgramModuleLesson[];
}

export interface ProgramCertification {
  id: number;
  name: string;
  exam_format: string;
  duration_minutes: number;
  delivery: string;
  pass_rate: string;
}

export interface ProgramFaq {
  question: string;
  answer: string;
}

export interface ProgramFacilitator {
  id: number;
  full_name: string;
  avatar_url: string;
  short_bio: string;
  credential_tags: string[];
}

// Detail view — adds the rich fields used on the program detail page
export interface Program extends ProgramListItem {
  outline: string;
  learning_outcomes: string[];
  who_should_attend: string[];
  faqs: ProgramFaq[];
  prerequisites: ProgramPrerequisite[];
  modules: ProgramModule[];
  certification: ProgramCertification | null;
  facilitators: ProgramFacilitator[];
}

export interface CreateProgramRequest {
  title: string;
  code: string;
  program_type: ProgramType;
  level: ProgramLevel;
  audience: ProgramAudience;
  purchase_mode: PurchaseMode;
  summary: string;
  outline: string;
  base_price_usd: string;
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  cover_image?: string; // confirmed field name on write, distinct from the read model's cover_image_url
  learning_outcomes?: string[];
  who_should_attend?: string[];
  faqs?: ProgramFaq[];
  prerequisites?: { kind: ProgramPrerequisite["kind"]; text: string; order: number }[];
  is_active: boolean;
}

export type UpdateProgramRequest = CreateProgramRequest; // PUT — same shape as create
export type PatchProgramRequest = Partial<CreateProgramRequest>; // PATCH — partial