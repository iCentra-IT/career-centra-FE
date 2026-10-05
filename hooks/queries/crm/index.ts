import { useQuery } from "@tanstack/react-query";
import {
  getCampaign,
  getCampaigns,
  getCrmLead,
  getCrmLeadNotes,
  getCrmDashboard,
  getCrmLeads,
  getCrmTasks,
  getLeadMagnet,
  getLeadMagnets,
} from "@/lib/api/crm";
import { queryKeys } from "@/lib/api/query-keys";
import type { CrmTaskFilters, LeadFilters } from "@/types/crm";

export function useCrmLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: queryKeys.crm.leads(filters),
    queryFn: () => getCrmLeads(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCrmLead(id: string) {
  return useQuery({
    queryKey: queryKeys.crm.lead(id),
    queryFn: () => getCrmLead(id),
    enabled: !!id,
  });
}

export function useCrmLeadNotes(leadId: string) {
  return useQuery({
    queryKey: queryKeys.crm.notes(leadId),
    queryFn: () => getCrmLeadNotes(leadId),
    enabled: !!leadId,
  });
}

export function useCrmTasks(filters?: CrmTaskFilters) {
  return useQuery({
    queryKey: queryKeys.crm.tasks(filters),
    queryFn: () => getCrmTasks(filters),
  });
}

export function useLeadMagnets() {
  return useQuery({
    queryKey: queryKeys.crm.leadMagnets,
    queryFn: getLeadMagnets,
  });
}

export function useLeadMagnet(slug: string) {
  return useQuery({
    queryKey: queryKeys.crm.leadMagnet(slug),
    queryFn: () => getLeadMagnet(slug),
    enabled: !!slug,
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: queryKeys.crm.campaigns,
    queryFn: getCampaigns,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.crm.campaign(id),
    queryFn: () => getCampaign(id),
    enabled: !!id,
  });
}

export function useCrmDashboard() {
  return useQuery({
    queryKey: queryKeys.crm.dashboard,
    queryFn: getCrmDashboard,
    staleTime: 60 * 1000,
  });
}
