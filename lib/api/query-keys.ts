import type { FacilitatorApplicationFilters } from "@/types/facilitator";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  students: {
    all: ["students"] as const,
    detail: (id: string) => ["students", id] as const,
    profile: ["students", "profile"] as const, // add this
  },

  admin: {
    dashboard: ["admin", "dashboard"] as const,
  },

  programs: {
    all: ["programs"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["programs", "list", filters] as const,
    detail: (slug: string) => ["programs", slug] as const,
  },

  careerPaths: {
    all: ["career-paths"] as const,
    detail: (slug: string) => ["career-paths", slug] as const,
    programs: (slug: string) => ["career-paths", slug, "programs"] as const,
  },

  coupons: {
    adminAll: ["coupons", "admin"] as const,
    adminDetail: (id: number) => ["coupons", "admin", id] as const,
  },

  enrollments: {
    all: (filters?: Record<string, unknown>) =>
      ["enrollments", filters] as const,
    detail: (id: number) => ["enrollments", id] as const,
    receipt: (id: number) => ["enrollments", id, "receipt"] as const,
  },

  adminEnrollments: {
    all: (filters?: Record<string, unknown>) => ["admin-enrollments", filters] as const,
  },

  adminLearners: {
    all: ["admin-learners"] as const,
  },

  adminUsers: {
    all: ["admin-users"] as const,
    detail: (id: number) => ["admin-users", id] as const,
  },

  facilitatorApplications: {
    all: (filters?: FacilitatorApplicationFilters) => ["facilitator-applications", filters] as const,
    detail: (id: number) => ["facilitator-applications", id] as const,
  },

  facilitatorProfiles: {
    all: ["facilitator-profiles"] as const,
  },

  notifications: {
    all: ["notifications"] as const,
  },

  search: {
    query: (q: string) => ["search", q] as const,
  },

  cohorts: {
    all: ["cohorts"] as const,
    detail: (id: number) => ["cohorts", id] as const,
    sessions: (cohortId: number) => ["cohorts", cohortId, "sessions"] as const,
    sessionDetail: (cohortId: number, id: number) =>
      ["cohorts", cohortId, "sessions", id] as const,
  },

  studentDashboard: {
    overview: ["student-dashboard", "overview"] as const,
    courses: ["student-dashboard", "courses"] as const,
    enrollments: ["student-dashboard", "enrollments"] as const,
    schedule: ["student-dashboard", "schedule"] as const,
    certificates: ["student-dashboard", "certificates"] as const,
    purchaseHistory: ["student-dashboard", "purchase-history"] as const,
  },
} as const;
