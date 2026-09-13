// lib/api/types/program.ts
import { ProgramAccreditation } from "./student";
import { CertificateProvider } from "./cart";

// Confirmed the only two real values: "dual" (both base_price_usd and base_price_ngn apply) and
// "usd_only" (single-currency, USD).
export type PricingMode = 'dual' | 'usd_only' | string;

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
// Confirmed real shape from an actual captured GET /api/programs/ response (paginated: {success,
// count, total_pages, next, previous, results}, 8 real programs) — every field below was present
// on every item, so none of them are optional.
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
  platform: string;
  platform_display: string;
  purchase_mode: PurchaseMode;
  purchase_mode_display: string;
  summary: string;
  pricing_mode: PricingMode;
  pricing_mode_display: string;
  base_price_usd: string;
  base_price_ngn: string;
  // effective_price_* mirrors base_price_* on every captured item (no per-listing override seen
  // yet) — default_price/currency is the one to actually display: for pricing_mode "dual" it was
  // effective_price_ngn re-labelled "NGN"; for "usd_only" the sample showed a real oddity —
  // default_price "0.00"/currency "NGN" even though effective_price_usd was the real 1500.00 — so
  // default_price isn't reliable for a usd_only program. See programDisplayPrice below.
  effective_price_usd: string;
  effective_price_ngn: string;
  default_price: string;
  currency: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  has_icentra_badge: boolean;
  certificate_provider: CertificateProvider;
  // Confirmed genuinely distinct from certificate_provider — e.g. a program with
  // certificate_provider "icentra" came back with certification_body "pmi" when has_pmi_badge was
  // its only true badge. Server-derived from the badges, not a mirror of certificate_provider.
  certification_body: CertificateProvider;
  accreditations: ProgramAccreditation[];
  cover_image_url: string;
  next_cohort: string | null; // always null on every captured item so far — shape when set is unconfirmed
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Display price for a program in list views. Per pricing_mode:
// - "dual": default_price/currency is correct (NGN, matching effective_price_ngn).
// - "usd_only": default_price/currency was seen coming back wrong ("0.00"/"NGN") on a real
//   captured usd_only program whose real price was effective_price_usd "1500.00" — fall back to
//   that instead of trusting default_price for this mode.
export function programDisplayPrice(
  program: PublicProgramListing,
): { amount: string; currency: string } {
  if (program.pricing_mode === "usd_only") {
    return { amount: program.effective_price_usd, currency: "USD" };
  }
  return { amount: program.default_price, currency: program.currency };
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
  pricing_mode: PricingMode;
  pricing_mode_display: string;
  base_price_usd: string; // decimal serialized as string — DO NOT parseFloat for display, keep as string until formatting
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  has_icentra_badge: boolean;
  // Confirmed present on both GET /api/programs/{slug}/ and PATCH/PUT's response by a later doc
  // dump — the edit form previously had to guess these from has_pmi_badge/has_pecb_badge, which
  // silently corrupted them (e.g. reset has_icentra_badge to false) on every save.
  certificate_provider: CertificateProvider;
  // Read-only, server-derived — confirmed distinct from certificate_provider (a real create
  // response had certificate_provider "icentra" but certification_body "pmi", derived from which
  // accreditation badges were set). Not part of CreateProgramRequest; don't try to write it.
  certification_body: CertificateProvider;
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