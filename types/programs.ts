// lib/api/types/program.ts

export type ProgramType = 'Certifications' | string; 
// ^ only one value seen so far — send the full choices list when you have it (e.g. Bootcamp, Course?)

export type ProgramLevel = 'foundation' | string; 
// ^ same — placeholder until full choices list (foundation/intermediate/advanced?)

export type ProgramAudience = 'individual' | string; 
// ^ placeholder (individual/corporate/group?)

export type PurchaseMode = 'direct' | string; 
// ^ placeholder (direct/installment/subscription?)

// List view — lighter payload, no "outline"
export interface ProgramListItem {
  id: number;
  title: string;
  slug: string;
  program_type: ProgramType;
  level: ProgramLevel;
  level_display: string;
  audience: ProgramAudience;
  audience_display: string;
  purchase_mode: PurchaseMode;
  purchase_mode_display: string;
  summary: string;
  base_price_usd: string; // decimal serialized as string — DO NOT parseFloat for display, keep as string until formatting
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Detail view — adds "outline"
export interface Program extends ProgramListItem {
  outline: string;
}

export interface CreateProgramRequest {
  title: string;
  program_type: ProgramType;
  level: ProgramLevel;
  audience: ProgramAudience;
  purchase_mode: PurchaseMode;
  summary: string;
  outline: string;
  base_price_usd: string;
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  is_active: boolean;
}

export type UpdateProgramRequest = CreateProgramRequest; // PUT — same shape as create
export type PatchProgramRequest = Partial<CreateProgramRequest>; // PATCH — partial