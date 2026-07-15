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
} as const;
