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
  // Scopes the catalog to one referral partner's programs and discount — see
  // types/referral-partner.ts. A nonexistent slug 404s with a plain {detail} error rather than
  // this app's usual {success, message, errors} envelope, confirmed live.
  referral_partner?: string;
  // Confirmed real: a captured response showed count 26 / total_pages 2 (page size 20) with a
  // `next` URL of "...?page=2" — standard DRF PageNumberPagination.
  page?: number;
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
  // yet). default_price/currency are kept here since they're real fields on this endpoint, but
  // nothing reads them — default_price was confirmed wrong for "usd_only" programs (came back
  // "0.00"/"NGN" for a real $1500 program), so priceForMode/programDisplayPrice below compute the
  // display price themselves from pricing_mode + base_price_usd/base_price_ngn instead.
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
  // Confirmed present on GET /api/programs/ (the list/catalog endpoint) by a later real capture —
  // an earlier check of this same endpoint didn't show it, so the backend evidently added it to
  // the list serializer after that. Empty string when unset.
  badge_image_url: string;
  is_bestseller: boolean;
  next_cohort: string | null; // always null on every captured item so far — shape when set is unconfirmed
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// The price/currency to display for a given pricing_mode, computed rather than trusted from a
// "default_price" field — that field is only present on the GET /api/programs/ list endpoint (not
// on the single-program detail endpoint, and not on cohorts at all), and even there it was
// confirmed wrong for "usd_only" (a real captured usd_only program showed default_price "0.00"/
// currency "NGN" while its real price, effective_price_usd, was "1500.00"). Every "dual"-mode
// sample's default_price exactly matched its NGN amount/"NGN", so computing it this way from
// whichever USD/NGN pair the caller has (base_price_* for a program, effective_price_* for a
// cohort) reproduces the same result everywhere, without depending on a field that isn't always
// there and isn't always right.
export function priceForMode(
  pricingMode: PricingMode,
  usdAmount: string,
  ngnAmount: string,
): { amount: string; currency: string } {
  if (pricingMode === "usd_only") return { amount: usdAmount, currency: "USD" };
  // Some real "dual"-mode programs have been created with base_price_ngn left at "0.00" (never
  // actually filled in) while base_price_usd is a real price — showing "₦0.00" for those reads as
  // a bug ("this course is free?"), so fall back to the USD amount rather than trust a zero NGN
  // price that's almost certainly just an unset field, not a genuine ₦0 course.
  const ngn = parseFloat(ngnAmount);
  if (!ngn) return { amount: usdAmount, currency: "USD" };
  return { amount: ngnAmount, currency: "NGN" };
}

// Display price for a program in list/card views.
export function programDisplayPrice(
  program: PublicProgramListing,
): { amount: string; currency: string } {
  return priceForMode(program.pricing_mode, program.base_price_usd, program.base_price_ngn);
}

// Display price for a program card/detail view that has a specific cohort attached. Prefers the
// cohort's own effective_price_* (a real per-cohort override) — but every real cohort captured so
// far has BOTH effective_price_usd and effective_price_ngn sitting at "0.00" (no override actually
// set), which produced "$0.00"/"₦0.00" cards for programs that have a perfectly real price on the
// program record itself. So: only trust the cohort's price when at least one side of it is
// genuinely non-zero; otherwise fall back to the program's base price, same as no cohort at all.
export function programOrCohortPrice(
  pricingMode: PricingMode,
  program: { base_price_usd: string; base_price_ngn: string },
  cohort?: { effective_price_usd: string; effective_price_ngn: string },
): { amount: string; currency: string } {
  if (cohort && (parseFloat(cohort.effective_price_usd) || parseFloat(cohort.effective_price_ngn))) {
    return priceForMode(pricingMode, cohort.effective_price_usd, cohort.effective_price_ngn);
  }
  return priceForMode(pricingMode, program.base_price_usd, program.base_price_ngn);
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
  badge_image_url: string; // see the matching note on PublicProgramListing — empty string when unset
  is_bestseller: boolean;
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

// A learner review — video-only (a YouTube link), no rating/text fields seen in the payload.
// id/created_at are server-assigned, same convention as faqs/prerequisites/modules below.
export interface ProgramReview {
  id: number;
  video_url: string;
  created_at: string;
}

// A downloadable resource file (course material, slides, etc.) — same shape as the dedicated
// student-facing GET /api/students/courses/{slug}/resources/ endpoint (types/student.ts's
// CourseResource), since both read from the same underlying files. iCentra-only per the write
// side's doc note — presumably meaning this is an iCentra-platform feature, not gated per-program.
export interface ProgramResource {
  id: number;
  title: string;
  file_url: string;
  order: number;
  created_at: string;
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
  reviews: ProgramReview[];
  // badge_image_url is inherited from ProgramListItem — confirmed present on both the list and
  // detail endpoints (an earlier check only caught it missing from a stale list response).
  // UNCONFIRMED — GET /api/programs/{slug}/ for a real program didn't include a `resources` key
  // at all (not even an empty array), so this may be write-only, only appear once resources
  // actually exist, or use a different read-side name. Verify against a real response once a
  // program has resources uploaded.
  resources: ProgramResource[];
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

// Write-side review shape — no id/created_at, those are server-assigned.
export interface CreateProgramReview {
  video_url: string;
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
  is_bestseller: boolean;
  // Who actually issues the certificate — separate from the has_*_badge accreditation flags
  // above, which just control which "authorized by" badges are shown.
  certificate_provider: CertificateProvider;
  // Confirmed a real file upload (DRF ImageField) — "not a file, check the encoding type on the
  // form" is DRF's rejection when this arrives as JSON/a string instead of multipart. Omit to
  // leave an existing image untouched on a PATCH; send `null` to explicitly clear it (this always
  // goes out as plain JSON since removing the image without picking a new one means the payload
  // has no File in it, so toRequestBody picks the JSON path where `null` serializes cleanly).
  cover_image?: File | null;
  // Same file-upload convention as cover_image above.
  badge_image?: File | null;
  // Multi-file upload — sent as repeated `resources` multipart fields (see
  // lib/api/form-data.ts's appendFormValue), not the bracketed nested-array encoding every other
  // array field here uses. Additive/replaces-wholesale on save is unconfirmed; treated as "the
  // files picked this time" like cover_image, not a per-file CRUD list.
  resources?: File[];
  learning_outcomes?: string[];
  who_should_attend?: string[];
  faqs?: ProgramFaq[];
  prerequisites?: { kind: ProgramPrerequisite["kind"]; text: string; order: number }[];
  modules?: CreateProgramModule[];
  certification?: CreateProgramCertification | null;
  reviews?: CreateProgramReview[];
  is_active: boolean;
}

export type UpdateProgramRequest = CreateProgramRequest; // PUT — same shape as create
export type PatchProgramRequest = Partial<CreateProgramRequest>; // PATCH — partial