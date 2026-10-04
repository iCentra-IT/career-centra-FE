import type { CrmLead } from "@/types/crm";

export function crmLeadName(lead: Pick<CrmLead, "first_name" | "last_name" | "email">): string {
  return `${lead.first_name} ${lead.last_name}`.trim() || lead.email;
}
