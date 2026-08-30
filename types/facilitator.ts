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
