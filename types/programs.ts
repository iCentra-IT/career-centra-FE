// lib/api/types/program.ts

// Free-text category, not an enum — confirmed values so far: "Agile, Product & Business Analysis",
// "Project & Portfolio Management", "Workforce Capability"
export type ProgramType = string;

export type ProgramLevel = 'foundation' | 'practitioner' | 'advanced' | string;

export type ProgramAudience = 'individual' | 'corporate' | string;

export type PurchaseMode = 'direct' | 'quote' | string;

// List view — lighter payload, no "outline"
export interface ProgramListItem {
  id: number;
  title: string;
  slug: string;
  code: string;
  program_type: ProgramType;
  level: ProgramLevel;
  level_display: string;
  audience: ProgramAudience;
  audience_display: string;
  platform: string; // e.g. "careercentra"
  platform_display: string; // e.g. "careercentra.icentra.com"
  purchase_mode: PurchaseMode;
  purchase_mode_display: string;
  summary: string;
  base_price_usd: string; // decimal serialized as string — DO NOT parseFloat for display, keep as string until formatting
  base_price_ngn: string;
  has_pmi_badge: boolean;
  has_pecb_badge: boolean;
  cover_image_url: string;
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