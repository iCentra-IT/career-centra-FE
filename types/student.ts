import { User } from "./user";

// lib/api/types/student.ts
// Locked to the backend's IndustryChoices.
export type Industry =
  | 'finance_and_banking'
  | 'real_estate'
  | 'construction'
  | 'oil_and_gas'
  | 'hospitality_and_tourism'
  | 'telecommunications'
  | 'information_technology'
  | 'healthcare_and_pharmaceuticals'
  | 'others';

// Locked to the backend's ReferralSourceChoices.
export type ReferralSource =
  | 'friend'
  | 'relative'
  | 'colleague'
  | 'social_media'
  | 'sponsored_ads'
  | 'icentra_website'
  | 'others';

// Same currency set the cart/checkout endpoints accept (types/cart.ts's CartCurrency) — the
// currency-preference endpoint's own doc only calls out NGN/USD as the toggle pair, but says any
// supported currency can be set explicitly, so reusing that shared union rather than a narrower one.
export type CurrencyPreference = "NGN" | "USD" | "EUR" | "GBP" | "GHS" | "KES";

// Confirmed real shape by a live capture of POST /api/students/currency-preference/'s response —
// noticeably richer than what GET/PUT/PATCH /api/students/profile/ was previously typed as (adds
// first_name/last_name/email/avatar_url/currency_preference/timezone/language directly on the
// profile, alongside the nested `user`). Same resource either way, so this is now the one shape.
export interface StudentProfile {
  id: number;
  user: User;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  phone: string;
  country: string; // ISO country code, e.g. "NG" — could type as CountryCode union if you want strict validation
  currency_preference: CurrencyPreference;
  timezone: string;
  language: string;
  location: string;
  org_name: string;
  position: string;
  years_of_experience: number;
  industry: Industry;
  referral_source: ReferralSource;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// POST /api/students/currency-preference/ — omit currency_preference to toggle between NGN/USD,
// or pass it explicitly to set any supported currency. Returns the full StudentProfile.
export interface SetCurrencyPreferenceRequest {
  currency_preference?: CurrencyPreference;
}

// lib/api/types/student.ts (add)
export interface UpdateStudentProfileRequest {
  phone: string;
  country: string;
  location: string;
  org_name: string;
  position: string;
  years_of_experience: number;
  industry: Industry;
  referral_source: ReferralSource;
}

// lib/api/types/student-dashboard.ts

export interface ProgramAccreditation {
  issuer: string;
  label: string;
}

// This is the "rich" program summary used across dashboard/courses/schedule/certificates —
// distinct from CohortProgramSummary (cohorts.ts) and EnrollmentProgramSummary (enrollment.ts)
export interface DashboardProgramSummary {
  id: number;
  title: string;
  slug: string;
  program_type: string; // reuse ProgramType union from program.ts if you want strict typing later
  summary: string;
  cover_image_url: string;
  accreditations: ProgramAccreditation[];
}

export interface DashboardCohortSummary {
  id: number;
  starts_on: string;
  duration_weeks: number;
  ends_on: string;
  delivery_mode: string; // likely "online" | "in_person" | "hybrid" — confirm full choices
  location: string;
  facilitator_name: string;
  facilitator: string; // unclear how this differs from facilitator_name — confirm with backend
}

export interface CourseProgress {
  basis: string; // "sessions" seen — likely also could vary, confirm if other bases exist
  total: number;
  completed: number;
  percent: number;
  started: boolean;
  completed_all: boolean;
}

export interface CourseCertificateSummary {
  certificate_number: string;
  file_url: string;
  issued_at: string;
}

// Shared "enrolled course" shape used in dashboard.active_courses / completed_courses,
// students/courses active_courses, and students/enrollments results
export interface StudentCourse {
  id: number;
  program: DashboardProgramSummary;
  cohort: DashboardCohortSummary;
  progress: CourseProgress;
  certificate?: CourseCertificateSummary | null; // present on dashboard/enrollments, absent on plain /courses/ sample — confirm optionality
  amount_paid?: string; // present on dashboard/enrollments, absent on plain /courses/ sample
  currency?: string;
  status?: string; // "confirmed" seen — likely "pending" | "active" | "completed" | "cancelled" too, confirm full set
  created_at?: string;
}

export interface UpcomingSession {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_url: string;
  program_title: string;
  cohort_id: number;
}

export interface ClassUpdate {
  id: number;
  kind: "reschedule" | "resource" | "announcement" | string; // confirmed values so far
  title: string;
  body: string;
  session: number | null; // session ID, null seen when not tied to a specific session
  program_title: string;
  program_slug: string;
  created_at: string;
}

export interface DashboardStats {
  purchased: number;
  active: number;
  completed: number;
  certificates: number;
}

export interface CertificateProgramSummary {
  id: number;
  title: string;
  slug: string;
  program_type: string;
  summary: string;
  cover_image_url: string;
  accreditations: ProgramAccreditation[];
}

export interface StudentCertificate {
  id: number;
  certificate_number: string;
  status: string; // confirm full choices — "issued" | "revoked" | "pending"?
  issued_at: string;
  file_url: string;
  program: CertificateProgramSummary;
}

export interface CertificatesResponse {
  certificates: StudentCertificate[];
}

export interface StudentCoursesResponse {
  active_courses: StudentCourse[];
}


export interface StudentDashboardResponse {
  stats: DashboardStats;
  active_courses: StudentCourse[];
  upcoming_sessions: UpcomingSession[];
  class_updates: ClassUpdate[];
  completed_courses: StudentCourse[];
}

export interface ScheduleSession {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_url: string;
  program_title: string;
  cohort_id: number;
}

export interface ScheduleItem {
  progress: CourseProgress;
  id: number;
  program: DashboardProgramSummary;
  cohort: DashboardCohortSummary;
  sessions: ScheduleSession[];
}

export interface StudentScheduleResponse {
  schedule: ScheduleItem[];
}

// GET /api/students/courses/{slug}/resources/ — the program's downloadable resource files
// (uploaded via the program's own `resources` multi-file field, see types/programs.ts), gated on
// the student having a confirmed enrollment in that program.
export interface CourseResource {
  id: number;
  title: string;
  file_url: string;
  order: number;
  created_at: string;
}

export type PatchStudentProfileRequest = Partial<UpdateStudentProfileRequest>;