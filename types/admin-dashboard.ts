// GET /api/admin/dashboard/ — confirmed real shape (single aggregate endpoint for the admin overview page).

export interface AdminDashboardOverview {
  total_programs: number;
  total_revenue_usd: string;
  total_revenue_ngn: string;
  active_cohorts: number;
  total_enrollments: number;
  recent_payments_count: number;
  recent_payments_usd: string;
  recent_payments_ngn: string;
}

export interface AdminDashboardEnrollment {
  id: number;
  learner_name: string;
  learner_email: string;
  program_title: string;
  program_slug: string;
  cohort_starts_on: string;
  amount_paid: string;
  amount_paid_usd: string | null;
  currency: string;
  status: string;
  payment_gateway: string;
  created_at: string;
}

// A recently published facilitator profile — distinct from FacilitatorApplication (no ATS/status
// fields here, just domains + publish state).
export interface AdminDashboardFacilitator {
  id: number;
  full_name: string;
  domains: string[];
  is_published: boolean;
  created_at: string;
}

export interface AdminDashboardPaymentStatusSummary {
  pending: number;
  confirmed: number;
  failed: number;
}

export interface AdminDashboard {
  overview: AdminDashboardOverview;
  recent_enrollments: AdminDashboardEnrollment[];
  recent_facilitators: AdminDashboardFacilitator[];
  payment_status_summary: AdminDashboardPaymentStatusSummary;
  low_seat_alerts: unknown[]; // shape unconfirmed — sample showed an empty array
}
