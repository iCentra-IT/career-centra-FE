// lib/api/types/addon.ts
// Program add-ons (sold alongside a cohort) and per-cohort overrides of their price/availability.

// Seen so far: support, question_bank, coaching_group. Kept open for kinds not yet listed.
export type AddonKind = "support" | "question_bank" | "coaching_group" | (string & {});
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
  created_at: string;
  updated_at: string;
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
