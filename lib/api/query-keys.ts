import type { FacilitatorApplicationFilters } from "@/types/facilitator";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  students: {
    all: ["students"] as const,
    detail: (id: string) => ["students", id] as const,
    profile: ["students", "profile"] as const, // add this
    courseResources: (slug: string) => ["students", "courses", slug, "resources"] as const,
  },

  admin: {
    dashboard: ["admin", "dashboard"] as const,
  },

  programs: {
    all: ["programs"] as const,
    list: <T extends object>(filters?: T) => ["programs", "list", filters] as const,
    detail: (slug: string) => ["programs", slug] as const,
  },

  careerPaths: {
    all: ["career-paths"] as const,
    list: <T extends object>(filters?: T) => ["career-paths", "list", filters] as const,
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

  cart: {
    root: ["cart"] as const,
    view: (opts?: Record<string, unknown>) => ["cart", "view", opts ?? {}] as const,
    count: ["cart-count"] as const,
  },

  orders: {
    detail: (id: number) => ["orders", id] as const,
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
    detail: (id: number) => ["facilitator-profiles", id] as const,
    me: ["facilitator-profiles", "me"] as const,
  },

  facilitatorDashboard: {
    overview: ["facilitator-dashboard", "overview"] as const,
    programs: ["facilitator-dashboard", "programs"] as const,
    programDetail: (cohortId: number) => ["facilitator-dashboard", "programs", cohortId] as const,
  },

  notifications: {
    all: ["notifications"] as const,
  },

  search: {
    query: (q: string) => ["search", q] as const,
  },

  cohorts: {
    all: ["cohorts"] as const,
    list: <T extends object>(filters?: T) => ["cohorts", "list", filters] as const,
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

  exchangeRates: {
    all: ["exchange-rates"] as const,
    list: <T extends object>(filters?: T) => ["exchange-rates", "list", filters] as const,
    detail: (id: number) => ["exchange-rates", id] as const,
  },

  certificates: {
    all: ["certificates"] as const,
  },

  testimonials: {
    program: (slug: string) => ["testimonials", "program", slug] as const,
    adminAll: (page?: number) => ["testimonials", "admin", page] as const,
    adminDetail: (id: number) => ["testimonials", "admin", "detail", id] as const,
    public: ["testimonials", "public"] as const,
  },

  referralPartners: {
    adminAll: ["referral-partners", "admin"] as const,
    adminDetail: (id: number) => ["referral-partners", "admin", id] as const,
  },
  questionBanks: {
    all: ["question-banks"] as const,
    detail: (id: number) => ["question-banks", id] as const,
    attempts: (bankId: number) => ["question-banks", bankId, "attempts"] as const,
    attempt: (attemptId: number) => ["attempts", attemptId] as const,
    question: (id: number) => ["admin-questions", id] as const,
  },

  programAddons: {
    list: (slug: string) => ["program-addons", slug] as const,
  },

  cohortAddonOverrides: {
    list: (cohortId: number) => ["cohort-addon-overrides", cohortId] as const,
  },

  adminCarts: {
    all: ["admin-carts"] as const,
    list: (page?: number) => ["admin-carts", "list", page] as const,
    user: (userId: number) => ["admin-carts", "user", userId] as const,
  },

  crm: {
    dashboard: ["crm", "dashboard"] as const,
    leads: <T extends object>(filters?: T) => ["crm", "leads", filters] as const,
    lead: (id: string) => ["crm", "leads", id] as const,
    notes: (leadId: string) => ["crm", "lead-notes", leadId] as const,
    tasks: <T extends object>(filters?: T) => ["crm", "tasks", filters] as const,
    leadMagnets: ["crm", "lead-magnets"] as const,
    leadMagnet: (slug: string) => ["crm", "lead-magnets", slug] as const,
    campaigns: ["crm", "campaigns"] as const,
    campaign: (id: string) => ["crm", "campaigns", id] as const,
  },

  blog: {
    landing: ["blog", "landing"] as const,
    categories: ["blog", "categories"] as const,
    categoryPosts: (slug: string, page?: number) => ["blog", "categories", slug, page] as const,
    posts: <T extends object>(filters?: T) => ["blog", "posts", filters] as const,
    post: (slug: string) => ["blog", "posts", slug] as const,
    comments: (slug: string) => ["blog", "posts", slug, "comments"] as const,
    adminPosts: <T extends object>(filters?: T) => ["blog", "admin", "posts", filters] as const,
    adminComments: <T extends object>(filters?: T) => ["blog", "admin", "comments", filters] as const,
    analytics: (days?: number | "all") => ["blog", "admin", "analytics", days] as const,
    newsletterIssues: ["blog", "newsletter", "issues"] as const,
    newsletterIssue: (id: number) => ["blog", "newsletter", "issues", id] as const,
    newsletterSubscribers: <T extends object>(filters?: T) =>
      ["blog", "newsletter", "subscribers", filters] as const,
    newsletterSummary: ["blog", "newsletter", "summary"] as const,
  },
} as const;
