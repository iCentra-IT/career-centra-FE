// lib/api/types/program.ts
import { ProgramAccreditation } from "./student";
import { CertificateProvider } from "./cart";

// Confirmed value: "dual" (both base_price_usd and base_price_ngn apply). No other values
// confirmed yet — "usd_only"/"ngn_only" are a reasonable guess for a single-currency program,
// flag for backend confirmation if the UI needs to branch on them beyond just submitting the string.
export type PricingMode = 'dual' | 'usd_only' | 'ngn_only' | string;

// Confirmed full enum from GET /api/programs/'s program_type filter parameter docs — kept the
// `| string` fallback since the backend may add more tabs later without a frontend redeploy.
export type ProgramType =
  | "Agile, Product & Business Analysis"
  | "Career Pathways"
  | "Certifications"
  | "Consultation-Led Engagement"
  | "Corporate Learning"
  | "Cybersecurity & Risk"
  | "Digital Transformation & AI"
  | "Enrollment-Driven Experience"
  | "Enterprise Certifications"
  | "Executive Education"
  | "Innovation & Digital Economy"
  | "Leadership Capability"
  | "Project & Portfolio Management"
  | "Strategic Transformation"
  | "Workforce Capability"
  | string;

// Confirmed full enum from GET /api/programs/'s level filter parameter docs.
export type ProgramLevel = 'foundation' | 'professional' | 'advanced' | 'specialized' | string;

// Confirmed full enum from GET /api/programs/'s audience filter parameter docs.
export type ProgramAudience = 'individual' | 'corporate' | 'executive' | string;

export type PurchaseMode = 'direct' | 'quote' | string;

// Confirmed query params for GET /api/programs/ (the public catalog listing).
export interface ProgramListFilters {
  search?: string;
  program_type?: ProgramType;
  level?: ProgramLevel;
  audience?: ProgramAudience;
  certification_body?: CertificateProvider;
  price_min?: string;
  price_max?: string;
}

// GET /api/programs/ list item — confirmed real shape (paginated: {success, count, total_pages,
// next, previous, results}). One row per catalog program.
//
// IMPORTANT: this does NOT embed cohorts. An earlier capture of this endpoint looked like it did
// (there used to be a `cohorts: ProgramCohort[]` field here), but a later doc dump plus a real
// runtime crash ("program.cohorts is not iterable") confirmed that was wrong — cohorts live only
// on GET /api/cohorts/ (types/cohort.ts's `Cohort`), each embedding a `program` summary the other
// way around. Use useCohortsByProgram(program.id) (hooks/queries/cohort) to get a program's
// scheduled cohorts, not this type.
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
  // platform/pricing_mode/has_icentra_badge/certificate_provider confirmed present on this list
  // item by a later GET /api/programs/ doc dump — added here alongside the original capture's fields.
  platform?: string;
  platform_display?: string;
  purchase_mode: PurchaseMode;
  purchase_mode_display: string;
  summary: string;
  pricing_mode?: PricingMode;
  pricing_mode_display?: string;
  base_price_usd: string;
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  has_icentra_badge?: boolean;
  certificate_provider?: CertificateProvider;
  // Also present in the same dump as certificate_provider above with an unconfirmed (Swagger
  // placeholder) value — likely just the filter-param name mirrored back, but kept separate rather
  // than assumed identical until confirmed.
  certification_body?: string;
  accreditations: ProgramAccreditation[];
  cover_image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Display price for a program in list views — pass a cohort's effective_price_usd (from
// types/cohort.ts's Cohort, fetched separately via useCohortsByProgram) when the caller has one
// and wants the price to match a specific cohort; otherwise falls back to the catalog base price.
export function programDisplayPrice(
  program: PublicProgramListing,
  cohortPriceUsd?: string,
): { amount: string; currency: string } {
  return { amount: cohortPriceUsd ?? program.base_price_usd, currency: "USD" };
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

// Write-side module/lesson shapes — no id/lesson_count, those are server-assigned/derived.
export interface CreateProgramModuleLesson {
  title: string;
  order: number;
}

export interface CreateProgramModule {
  title: string;
  order: number;
  lessons: CreateProgramModuleLesson[];
}

// Write-side certification shape — no id, that's server-assigned.
export interface CreateProgramCertification {
  name: string;
  exam_format: string;
  duration_minutes: number;
  delivery: string;
  pass_rate: string;
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
  pricing_mode: PricingMode;
  base_price_usd: string;
  base_price_ngn: string;
  // Independent accreditation badges — a program can carry any combination of these.
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  has_icentra_badge: boolean;
  // Who actually issues the certificate — separate from the has_*_badge accreditation flags
  // above, which just control which "authorized by" badges are shown.
  certificate_provider: CertificateProvider;
  // Confirmed a real file upload (DRF ImageField) — "not a file, check the encoding type on the
  // form" is DRF's rejection when this arrives as JSON/a string instead of multipart. Omit to
  // leave an existing image untouched on a PATCH.
  cover_image?: File;
  learning_outcomes?: string[];
  who_should_attend?: string[];
  faqs?: ProgramFaq[];
  prerequisites?: { kind: ProgramPrerequisite["kind"]; text: string; order: number }[];
  modules?: CreateProgramModule[];
  certification?: CreateProgramCertification | null;
  is_active: boolean;
}

export type UpdateProgramRequest = CreateProgramRequest; // PUT — same shape as create
export type PatchProgramRequest = Partial<CreateProgramRequest>; // PATCH — partial