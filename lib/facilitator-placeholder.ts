// -----------------------------------------------------------------------------
// PLACEHOLDER DATA — facilitator dashboard
//
// There are no facilitator-scoped endpoints yet (assigned programs, my upcoming
// sessions, facilitation stats, recent updates). Everything below is static mock
// data so the screens can be built and reviewed. Replace each export with a real
// query hook once the backend exists, then delete this file.
//
// Likely endpoints to ask backend for:
//   GET /api/facilitators/me/overview/     -> stats + recent updates
//   GET /api/facilitators/me/programs/     -> assigned programs (+ cohort summary)
//   GET /api/facilitators/me/sessions/     -> upcoming / ongoing sessions
//   GET /api/facilitators/me/programs/:id/ -> one assigned program + its sessions
// -----------------------------------------------------------------------------

export interface FacilitatorStat {
  key: string;
  label: string;
  value: number;
  /** placeholder — no period-over-period comparison data exists yet */
  deltaLabel: string;
}

export interface FacilitatorSession {
  id: string;
  title: string;
  programTitle: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  joinUrl: string | null;
}

export interface FacilitatorUpdate {
  id: string;
  kind: string;
  title: string;
  body: string;
}

export interface FacilitatorProgramSummary {
  id: string;
  code: string;
  title: string;
  isActive: boolean;
  level: string;
  enrolledCount: number;
  nextCohortDate: string;
  durationWeeks: number;
}

export interface FacilitatorClassDetail {
  id: string;
  title: string;
  deliveryMode: string;
  isActive: boolean;
  startsOn: string;
  endsOn: string;
  leadFacilitator: string;
  sessions: FacilitatorSession[];
}

export const FACILITATOR_STATS: FacilitatorStat[] = [
  { key: "assigned_programs", label: "Assigned programs", value: 3, deltaLabel: "+6%" },
  { key: "upcoming_cohorts", label: "Upcoming cohorts", value: 2, deltaLabel: "+6%" },
  { key: "total_learners", label: "Total learners", value: 1, deltaLabel: "+6%" },
  { key: "pending_actions", label: "Pending actions", value: 7, deltaLabel: "+6%" },
];

const SAMPLE_SESSION: Omit<FacilitatorSession, "id"> = {
  title: "Project Environment & Frameworks",
  programTitle: "Project Management Professional (PMP)®",
  date: "2026-07-13",
  startTime: "18:00",
  endTime: "20:00",
  timezone: "WAT",
  joinUrl: null,
};

export const FACILITATOR_UPCOMING_SESSIONS: FacilitatorSession[] = [
  { id: "s1", ...SAMPLE_SESSION },
  { id: "s2", ...SAMPLE_SESSION },
  { id: "s3", ...SAMPLE_SESSION },
];

export const FACILITATOR_RECENT_UPDATES: FacilitatorUpdate[] = [
  {
    id: "u1",
    kind: "Announcement",
    title: "Cohort almost full",
    body: "PMP July cohort has 6 seats left.",
  },
  {
    id: "u2",
    kind: "Announcement",
    title: "Profile published",
    body: "Your public profile is now live.",
  },
  {
    id: "u3",
    kind: "Announcement",
    title: "New cohort assigned",
    body: "You were assigned to the PMP September cohort.",
  },
];

export const FACILITATOR_PROGRAMS: FacilitatorProgramSummary[] = [
  {
    id: "pmp",
    code: "PMI",
    title: "Project Management Professional (PMP)®",
    isActive: true,
    level: "Professional",
    enrolledCount: 48,
    nextCohortDate: "2026-07-13",
    durationWeeks: 8,
  },
];

export const FACILITATOR_CLASS_DETAILS: Record<string, FacilitatorClassDetail> = {
  pmp: {
    id: "pmp",
    title: "Project Management Professional (PMP)®",
    deliveryMode: "Online",
    isActive: true,
    startsOn: "2026-07-13",
    endsOn: "2026-09-04",
    leadFacilitator: "Dr. Amara Okafor",
    sessions: [
      { id: "c1", ...SAMPLE_SESSION },
      { id: "c2", ...SAMPLE_SESSION },
      { id: "c3", ...SAMPLE_SESSION },
    ],
  },
};
