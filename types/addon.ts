// lib/api/types/addon.ts
// Program add-ons (sold alongside a cohort) and per-cohort overrides of their price/availability.

// Confirmed full enum from the backend.
export type AddonKind =
  | "support"
  | "coaching_group"
  | "coaching_personalized"
  | "exam_membership"
  | "exam_non_membership"
  | "question_bank";

export const ADDON_KIND_OPTIONS: { value: AddonKind; label: string }[] = [
  { value: "support", label: "Support" },
  { value: "coaching_group", label: "Group coaching" },
  { value: "coaching_personalized", label: "Personalized coaching" },
  { value: "exam_membership", label: "Exam (member price)" },
  { value: "exam_non_membership", label: "Exam (non-member price)" },
  { value: "question_bank", label: "Question bank" },
];
export type AddonPricingMode = "dual" | "usd_only" | (string & {});

export interface ProgramAddon {
  id: number;
  program: number;
  name: string;
  description: string;
  kind: AddonKind;
  addon_type: AddonKind;
  selection_group: string; // add-ons sharing a non-empty group are mutually exclusive
  price_usd: string;
  price_ngn: string;
  pricing_mode: AddonPricingMode;
  question_bank: number | null; // set for question_bank-kind add-ons
  is_active: boolean;
  sort_order: number;
  // Added by the backend: false when at least one cohort overrides this add-on's price or availability.
  is_program_price_effective?: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/cohorts/<cohort_pk>/addons/ — what a learner can buy for one cohort. Availability and the
// price in the cohort's currency are already resolved server-side.
export interface CohortAddon {
  id: number;
  name: string;
  description: string;
  kind: AddonKind;
  addon_type: AddonKind;
  selection_group: string;
  is_available: boolean;
  currency: string;
  amount: number;
  amount_usd: number | null;
  sort_order: number;
}

export interface ProgramAddonWriteRequest {
  name: string;
  description?: string;
  kind: AddonKind;
  price_usd: string;
  price_ngn: string;
  pricing_mode: AddonPricingMode;
  is_active: boolean;
  sort_order: number;
  selection_group?: string;
  question_bank?: number | null;
}

export type PatchProgramAddonRequest = Partial<ProgramAddonWriteRequest>;

export interface CohortAddonOverride {
  id: number;
  cohort: number;
  addon: number;
  is_available: boolean;
  price_override_usd: string | null;
  price_override_ngn: string | null;
  created_at: string;
  updated_at: string;
}

export interface CohortAddonOverrideWriteRequest {
  addon: number;
  is_available: boolean;
  price_override_usd?: string | null;
  price_override_ngn?: string | null;
}
