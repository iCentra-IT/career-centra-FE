import { User } from "./user";

// lib/api/types/student.ts
export type Industry =
  | 'finance_and_banking'
  | string; // placeholder — send the full choices list when available, I'll lock this to a strict union

export type ReferralSource =
  | 'friend'
  | string; // same as above — placeholder until full choices are known

export interface StudentProfile {
  id: number;
  user: User;
  phone: string;
  country: string; // ISO country code, e.g. "NG" — could type as CountryCode union if you want strict validation
  location: string;
  org_name: string;
  position: string;
  years_of_experience: number;
  industry: Industry;
  referral_source: ReferralSource;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
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

export type PatchStudentProfileRequest = Partial<UpdateStudentProfileRequest>;