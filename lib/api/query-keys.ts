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
