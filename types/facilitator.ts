// lib/api/types/facilitator-application.ts

export interface FacilitatorApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  domain_areas: string;
  certifications_held: string;
  experience_years: number;
  motivation_statement: string;
  cv_url: string;
  cv_original_filename: string;
  ats_score: number;
  ats_result: "pending" | string;
  ats_result_display: string;
  ats_feedback: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | string;
  status_display: string;
  submitted_at: string;
  reviewed_at: string | null;
  updated_at: string;
}

export interface FacilitatorApplicationFilters {
  status?: string;
  ats_result?: string;
  search?: string;
}

export interface PatchFacilitatorApplicationRequest {
  status: FacilitatorApplication["status"];
}

// GET /api/facilitators/profiles/ — confirmed real shape (public approved-facilitator directory).
// Sample showed credential_tags as a bare "string", but the same field on ProgramCohortFacilitator
// (embedded facilitator data on GET /api/programs/) was confirmed as string[] from a genuine
// capture — treating it as string[] here too since it's almost certainly the same serializer field,
// and the sample's generic placeholder value doesn't reliably distinguish the two.
export interface ApprovedFacilitator {
  id: number;
  full_name: string;
  avatar_url: string;
  short_bio: string;
  credential_tags: string[];
}

// PLACEHOLDER — no public submission endpoint exists yet. Shape inferred from
// FacilitatorApplication's writable fields plus a CV file upload (also unconfirmed —
// no media/file upload endpoint exists yet either). Not wired to any API call.
export interface CreateFacilitatorApplicationRequest {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  domain_areas: string;
  certifications_held: string;
  motivation_statement?: string;
  cv: File;
}
