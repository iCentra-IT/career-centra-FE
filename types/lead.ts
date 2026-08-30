// lib/api/types/lead.ts

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  audience_type: "individual" | "corporate" | string;
  platform: "careercentra" | "learning" | string;
  intent_tier: "high" | "medium" | "low" | string;
  message: string;
}
