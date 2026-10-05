// lib/api/types/crm.ts
//
// CRM = leads captured from public forms + staff/marketer follow-up (notes, tasks, one-off
// campaigns, gated lead magnets). Shapes below mirror the backend's samples. Enums marked
// "confirmed" were given as the full list by the backend team; the rest are only the values seen
// in samples so far and stay `string` until they confirm the full set.

export type LeadSource = "enquiry" | "newsletter" | "waitlist" | "lead_magnet" | "external"; // confirmed
export type LeadPlatform = "learning" | "careercentra"; // confirmed
export type LeadAudienceType = "individual" | "enterprise" | "executive"; // confirmed
export type LeadIntentLevel = "high" | "mid" | "low"; // confirmed
export type LeadStatus = "new" | (string & {}); // only "new" seen so far

export interface CrmUserRef {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface CrmLead {
  id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  status: LeadStatus;
  source: LeadSource;
  campaign_source: string;
  url: string;
  platform: LeadPlatform;
  audience_type: LeadAudienceType;
  intent_level: LeadIntentLevel | null; // only set on intent-scored enquiry forms
  detected_country: string;
  message: string;
  next_follow_up_date: string | null;
  crm_synced: boolean;
  created_at: string;
  updated_at: string;
}

// Staff/marketer manual create and PUT/PATCH — same fields as the read shape, minus server-owned
// id/timestamps. Every field is optional on PATCH; email is the one the backend always sends.
export interface CrmLeadWriteRequest {
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: LeadStatus;
  source?: LeadSource;
  campaign_source?: string;
  url?: string;
  platform?: LeadPlatform;
  audience_type?: LeadAudienceType;
  intent_level?: LeadIntentLevel;
  detected_country?: string;
  message?: string;
  next_follow_up_date?: string | null;
  crm_synced?: boolean;
}

export type PatchCrmLeadRequest = Partial<CrmLeadWriteRequest>;

// POST /api/crm/leads/capture/ — public. Send intent_level ONLY on intent-scored enquiry forms
// (its presence is what triggers the sales-alert emails). Upserts by email.
export interface CaptureLeadRequest {
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  source: LeadSource;
  campaign_source?: string;
  url?: string;
  platform?: LeadPlatform;
  audience_type?: LeadAudienceType;
  intent_level?: LeadIntentLevel;
  message?: string;
}

// Raw response, not enveloped in {success, data} — confirmed by the sample.
export interface CaptureLeadResponse {
  message: string;
  id: string;
  created: boolean;
}

export interface CrmLeadNote {
  id: string;
  lead: string; // lead UUID
  author: CrmUserRef;
  note: string;
  created_at: string;
  updated_at: string;
}

// Sample POST/PUT bodies only showed `note`. `lead` is sent too — the response echoes it back and
// nothing else links the note to a lead. UNCONFIRMED whether the backend requires it on POST.
export interface CrmLeadNoteWriteRequest {
  lead: string;
  note: string;
}

export interface CrmTask {
  id: string;
  lead: string;
  title: string;
  description: string;
  assignee: CrmUserRef;
  due_date: string;
  priority: "low" | (string & {}); // only "low" seen so far
  status: "pending" | (string & {}); // only "pending" seen so far
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmTaskWriteRequest {
  lead: string;
  title: string;
  description?: string;
  assignee_id: number;
  due_date: string;
  priority?: string;
  status?: string;
}

export type PatchCrmTaskRequest = Partial<CrmTaskWriteRequest>;

export interface LeadMagnet {
  id: string;
  title: string;
  slug: string;
  description: string;
  file_url: string; // presigned, short-lived on read — don't cache
  is_active: boolean;
  created_at: string;
}

// Multipart on write. `file` is omitted on PATCH to keep the existing upload.
export interface LeadMagnetWriteRequest {
  title: string;
  slug: string;
  description?: string;
  file?: File | null;
  is_active?: boolean;
}

export type PatchLeadMagnetRequest = Partial<LeadMagnetWriteRequest>;

export interface LeadMagnetDownloadRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  job_title?: string;
}

export interface LeadMagnetDownloadResponse {
  message: string;
  file_url: string; // expires after 15 minutes — start the download immediately
}

export interface Campaign {
  id: string;
  subject: string;
  body_html: string;
  author: CrmUserRef;
  status: "draft" | (string & {}); // only "draft" seen in samples
  sent_at: string | null;
  recipient_count: number;
  failed_count: number;
  created_at: string;
}

// POST is the send itself — the email is queued immediately, no scheduling or templating.
// Opted-out recipients are excluded server-side even if their id is included.
export interface SendCampaignRequest {
  subject: string;
  body_html: string;
  lead_ids?: string[];
  user_ids?: number[];
  subscriber_ids?: number[];
}

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: LeadSource;
  platform?: LeadPlatform;
  audience_type?: LeadAudienceType;
  crm_synced?: boolean;
  page?: number;
  page_size?: number;
}

export interface UnsubscribeResponse {
  detail?: string;
  message?: string;
}

// GET /api/crm/dashboard/ — marketer only. Read-only roll-up of the CRM, campaigns, lead magnets,
// enrolment funnel and cart activity.
export interface CrmDashboardCohort {
  id: number;
  platform: string;
  starts_on: string;
  ends_on: string;
  number_of_class_days: number;
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
  facilitator_display: unknown[];
}

export interface CrmDashboard {
  leads: {
    total_leads: number;
    new_leads_7d: number;
    by_status: Record<string, number>;
  };
  follow_up_tasks: {
    pending_count: number;
    overdue_count: number;
    due_today_count: number;
  };
  campaigns_and_newsletter: {
    campaigns_sent_last_30_days: number;
    recent_campaigns: {
      id: string;
      subject: string;
      status: string;
      sent_at: string | null;
      recipient_count: number;
    }[];
    active_subscribers: number;
    new_subscribers_7d: number;
  };
  referral_partners_and_lead_magnets: {
    active_referral_partners: number;
    top_referral_partners: { id: number; name: string; slug: string; uses_count: number }[];
    total_lead_magnet_downloads: number;
    lead_magnet_downloads_7d: number;
    top_lead_magnet: { id: string; title: string; downloads: number } | null;
  };
  enrollment_funnel: {
    confirmed_enrollments_total: number;
    new_enrollments_7d: number;
    checkouts_initiated_7d: number;
    checkouts_confirmed_7d: number;
  };
  cart_activity: {
    overview: {
      total_carts: number;
      carts_with_items: number;
      empty_carts: number;
      abandoned_carts: number;
      new_carts_last_7_days: number;
      total_items_in_carts: number;
    };
    top_cohorts: { cohort: CrmDashboardCohort; in_cart_count: number }[];
    recent_activity: {
      id: number;
      user: { id: number; email: string; full_name: string };
      item_count: number;
      updated_at: string;
    }[];
  };
}
