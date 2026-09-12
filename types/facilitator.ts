// lib/api/types/facilitator-application.ts

export interface FacilitatorApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  // Confirmed array<string> by the real POST /api/facilitators/applications/ endpoint (sample value
  // "project_portfolio_mgmt" for domain_areas) — the "manage" detail endpoint's generic Swagger
  // sample showed these as a bare "string", which is just Swagger's placeholder quirk for arrays.
  domain_areas: string[];
  certifications_held: string[];
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

// Confirmed real CRUD resource: GET/POST /api/facilitators/profiles/ (admin/staff list+create),
// GET/PATCH/DELETE /api/facilitators/profiles/{id}/, POST /api/facilitators/profiles/invite/.
// Sample showed credential_tags as a bare "string", but the same field on ProgramCohortFacilitator
// (embedded facilitator data on GET /api/programs/) was confirmed as string[] from a genuine
// capture — treating it as string[] here too since it's almost certainly the same serializer field,
// and the sample's generic placeholder value doesn't reliably distinguish the two.
export interface FacilitatorProfile {
  id: number;
  full_name: string;
  application_id: number | null;
  avatar_url: string;
  short_bio: string;
  credential_tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Kept as an alias — the public marketing directory only ever reads the published subset of this
// same resource, but the shape is identical.
export type ApprovedFacilitator = FacilitatorProfile;

// avatar is a real file upload (same multipart convention as programs' cover_image) — omit to
// leave an existing avatar untouched on a PATCH.
export interface CreateFacilitatorProfileRequest {
  full_name: string;
  application_id?: number;
  avatar?: File;
  short_bio?: string;
  credential_tags?: string[];
  is_published?: boolean;
}

export type PatchFacilitatorProfileRequest = Partial<CreateFacilitatorProfileRequest>;

// POST /api/facilitators/profiles/invite/ — admin-only. Links an existing account by email if one
// exists, otherwise creates an inactive account and emails the facilitator a set-password link.
export interface InviteFacilitatorRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: File;
  short_bio?: string;
  credential_tags?: string[];
  is_published?: boolean;
}

// Confirmed real endpoint: POST /api/facilitators/applications/ — public multipart endpoint.
// cv_file is a real file upload (PDF or Word, max 5MB). domain_areas/certifications_held are
// arrays of backend-defined codes (sample showed "project_portfolio_mgmt" for domain_areas) — the
// full enum list isn't confirmed, so the UI collects them as free-entry tags rather than a fixed select.
export interface CreateFacilitatorApplicationRequest {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  domain_areas: string[];
  certifications_held: string[];
  experience_years: number;
  motivation_statement: string;
  cv_file: File;
}

export interface CreateFacilitatorApplicationResponse {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  domain_areas: string[];
  certifications_held: string[];
  experience_years: number;
  motivation_statement: string;
  status: string;
  submitted_at: string;
}
