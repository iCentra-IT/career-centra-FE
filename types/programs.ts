// lib/api/types/program.ts
import { ProgramAccreditation } from "./student";

// Free-text category, not an enum — confirmed values so far: "Agile, Product & Business Analysis",
// "Project & Portfolio Management", "Workforce Capability"
export type ProgramType = string;

export type ProgramLevel = 'foundation' | 'professional' | 'advanced' | string;

export type ProgramAudience = 'individual' | 'corporate' | string;

export type PurchaseMode = 'direct' | 'quote' | string;

export interface ProgramCohortFacilitator {
  id: number;
  full_name: string;
  avatar_url: string;
  short_bio: string;
  credential_tags: string[];
}

// A cohort embedded directly on a GET /api/programs/ list item — confirmed real shape.
export interface ProgramCohort {
  id: number;
  platform: string;
  starts_on: string;
  ends_on: string;
  duration_weeks: number;
  delivery_mode: string;
  location: string;
  seat_capacity: number;
  seats_taken: number;
  is_enrollment_open: boolean;
  is_sold_out: boolean;
  is_nearly_full: boolean;
  effective_price_usd: string;
  effective_price_ngn: string;
  default_price: string;
  currency: string;
  facilitator_display: ProgramCohortFacilitator[];
}

// GET /api/programs/ list item — confirmed real shape (paginated: {success, count, total_pages,
// next, previous, results}). One row per catalog program; each program embeds its own open
// cohorts directly rather than the list being bundled per-cohort.
export interface PublicProgramListing {
  id: number;
  title: string;
  slug: string;
  code: string;
  program_type: ProgramType;
  level: ProgramLevel;
  level_display: string;
  audience: ProgramAudience;
  audience_display: string;
  purchase_mode: PurchaseMode;
  purchase_mode_display: string;
  summary: string;
  base_price_usd: string;
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  accreditations: ProgramAccreditation[];
  cover_image_url: string;
  cohorts: ProgramCohort[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Picks a representative cohort's real default_price (in whatever currency it's billed in) as the
// price to show the user for this program in list views — falls back to the catalog base_price_usd
// only when the program has no cohorts at all. Pass a specific cohort (e.g. the next open one) when
// the caller has already picked one for other display purposes, so the price matches what's shown.
export function programDisplayPrice(
  program: PublicProgramListing,
  cohort?: ProgramCohort,
): { amount: string; currency: string } {
  const picked = cohort ?? program.cohorts[0];
  if (picked) return { amount: picked.default_price, currency: picked.currency };
  return { amount: program.base_price_usd, currency: "USD" };
}

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