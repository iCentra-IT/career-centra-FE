// lib/api/crm/index.ts
import { apiClient } from "../client";
import { toRequestBody } from "../form-data";
import { PaginatedResponse, ApiResponse, unwrapObject, unwrapList } from "@/types/api";
import type {
  CaptureLeadRequest,
  CrmDashboard,
  CaptureLeadResponse,
  Campaign,
  CrmLead,
  CrmLeadNote,
  CrmLeadNoteWriteRequest,
  CrmLeadWriteRequest,
  CrmTask,
  CrmTaskFilters,
  CrmTaskWriteRequest,
  LeadFilters,
  LeadMagnet,
  LeadMagnetDownloadRequest,
  LeadMagnetDownloadResponse,
  LeadMagnetWriteRequest,
  PatchCrmLeadRequest,
  PatchCrmTaskRequest,
  PatchLeadMagnetRequest,
  SendCampaignRequest,
  UnsubscribeResponse,
} from "@/types/crm";

// ----------------------------------------------------------------- leads (staff/marketer/admin)

export async function getCrmLeads(filters?: LeadFilters): Promise<PaginatedResponse<CrmLead>> {
  const { data } = await apiClient.get<PaginatedResponse<CrmLead>>("/api/crm/leads/", {
    params: filters,
  });
  return data;
}

export async function getCrmLead(id: string): Promise<CrmLead> {
  const { data } = await apiClient.get<ApiResponse<CrmLead> | CrmLead>(`/api/crm/leads/${id}/`);
  return unwrapObject<CrmLead>(data);
}

export async function createCrmLead(payload: CrmLeadWriteRequest): Promise<CrmLead> {
  const { data } = await apiClient.post<ApiResponse<CrmLead> | CrmLead>("/api/crm/leads/", payload);
  return unwrapObject<CrmLead>(data);
}

export async function patchCrmLead(id: string, payload: PatchCrmLeadRequest): Promise<CrmLead> {
  const { data } = await apiClient.patch<ApiResponse<CrmLead> | CrmLead>(
    `/api/crm/leads/${id}/`,
    payload,
  );
  return unwrapObject<CrmLead>(data);
}

export async function deleteCrmLead(id: string): Promise<void> {
  await apiClient.delete(`/api/crm/leads/${id}/`);
}

// CSV of whatever the list endpoint would return for these filters (pagination excluded server-side).
export async function exportCrmLeads(filters?: LeadFilters): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/api/crm/leads/export/", {
    params: filters,
    responseType: "blob",
  });
  return data;
}

// ------------------------------------------------------------------ public capture (no auth)

// Raw {message, id, created} response — not wrapped in {success, data}.
export async function captureCrmLead(payload: CaptureLeadRequest): Promise<CaptureLeadResponse> {
  const { data } = await apiClient.post<CaptureLeadResponse>("/api/crm/leads/capture/", payload);
  return data;
}

// ------------------------------------------------------------------------------ lead notes

// ASSUMPTION: notes are filtered per lead with a `lead` query param — not stated in the spec.
export async function getCrmLeadNotes(leadId: string): Promise<CrmLeadNote[]> {
  const { data } = await apiClient.get<PaginatedResponse<CrmLeadNote> | CrmLeadNote[]>(
    "/api/crm/lead-notes/",
    { params: { lead: leadId, page_size: 100 } },
  );
  return unwrapList<CrmLeadNote>(data);
}

export async function createCrmLeadNote(payload: CrmLeadNoteWriteRequest): Promise<CrmLeadNote> {
  const { data } = await apiClient.post<ApiResponse<CrmLeadNote> | CrmLeadNote>(
    "/api/crm/lead-notes/",
    payload,
  );
  return unwrapObject<CrmLeadNote>(data);
}

export async function patchCrmLeadNote(id: string, note: string): Promise<CrmLeadNote> {
  const { data } = await apiClient.patch<ApiResponse<CrmLeadNote> | CrmLeadNote>(
    `/api/crm/lead-notes/${id}/`,
    { note },
  );
  return unwrapObject<CrmLeadNote>(data);
}

export async function deleteCrmLeadNote(id: string): Promise<void> {
  await apiClient.delete(`/api/crm/lead-notes/${id}/`);
}

// -------------------------------------------------------------------------- follow-up tasks

// ASSUMPTION: tasks are filtered per lead with a `lead` query param, same as notes above.
export async function getCrmTasks(filters?: CrmTaskFilters): Promise<PaginatedResponse<CrmTask>> {
  const { data } = await apiClient.get<PaginatedResponse<CrmTask>>("/api/crm/tasks/", {
    params: filters,
  });
  return data;
}

export async function createCrmTask(payload: CrmTaskWriteRequest): Promise<CrmTask> {
  const { data } = await apiClient.post<ApiResponse<CrmTask> | CrmTask>("/api/crm/tasks/", payload);
  return unwrapObject<CrmTask>(data);
}

export async function patchCrmTask(id: string, payload: PatchCrmTaskRequest): Promise<CrmTask> {
  const { data } = await apiClient.patch<ApiResponse<CrmTask> | CrmTask>(
    `/api/crm/tasks/${id}/`,
    payload,
  );
  return unwrapObject<CrmTask>(data);
}

export async function deleteCrmTask(id: string): Promise<void> {
  await apiClient.delete(`/api/crm/tasks/${id}/`);
}

// ----------------------------------------------------------------------------- lead magnets

export async function getLeadMagnets(): Promise<LeadMagnet[]> {
  const { data } = await apiClient.get<PaginatedResponse<LeadMagnet> | LeadMagnet[]>(
    "/api/crm/lead-magnets/",
    { params: { page_size: 100 } },
  );
  return unwrapList<LeadMagnet>(data);
}

export async function getLeadMagnet(slug: string): Promise<LeadMagnet> {
  const { data } = await apiClient.get<ApiResponse<LeadMagnet> | LeadMagnet>(
    `/api/crm/lead-magnets/${slug}/`,
  );
  return unwrapObject<LeadMagnet>(data);
}

// Multipart when a File is present (the raw file goes to private R2 storage server-side); plain
// JSON otherwise — toRequestBody picks the encoding, same as programs' cover_image.
export async function createLeadMagnet(payload: LeadMagnetWriteRequest): Promise<LeadMagnet> {
  const { body, headers } = toRequestBody(stripUnset(payload));
  const { data } = await apiClient.post<ApiResponse<LeadMagnet> | LeadMagnet>(
    "/api/crm/lead-magnets/",
    body,
    { headers },
  );
  return unwrapObject<LeadMagnet>(data);
}

export async function patchLeadMagnet(slug: string, payload: PatchLeadMagnetRequest): Promise<LeadMagnet> {
  const { body, headers } = toRequestBody(stripUnset(payload));
  const { data } = await apiClient.patch<ApiResponse<LeadMagnet> | LeadMagnet>(
    `/api/crm/lead-magnets/${slug}/`,
    body,
    { headers },
  );
  return unwrapObject<LeadMagnet>(data);
}

export async function deleteLeadMagnet(slug: string): Promise<void> {
  await apiClient.delete(`/api/crm/lead-magnets/${slug}/`);
}

// Public — the email-capture modal's submit. Returns a presigned R2 URL good for 15 minutes.
export async function downloadLeadMagnet(
  slug: string,
  payload: LeadMagnetDownloadRequest,
): Promise<LeadMagnetDownloadResponse> {
  const { data } = await apiClient.post<LeadMagnetDownloadResponse>(
    `/api/crm/lead-magnets/${slug}/download/`,
    payload,
  );
  return data;
}

// An unset file must be omitted, not sent as null — null would travel as a JSON value, not a file.
function stripUnset<T extends object>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== null),
  ) as T;
}

// -------------------------------------------------------------------------------- campaigns

export async function getCampaigns(): Promise<PaginatedResponse<Campaign>> {
  const { data } = await apiClient.get<PaginatedResponse<Campaign>>("/api/crm/campaigns/");
  return data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.get<ApiResponse<Campaign> | Campaign>(`/api/crm/campaigns/${id}/`);
  return unwrapObject<Campaign>(data);
}

// This IS the send — there is no draft step in the API.
export async function sendCampaign(payload: SendCampaignRequest): Promise<Campaign> {
  const { data } = await apiClient.post<ApiResponse<Campaign> | Campaign>(
    "/api/crm/campaigns/",
    payload,
  );
  return unwrapObject<Campaign>(data);
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiClient.delete(`/api/crm/campaigns/${id}/`);
}

// ----------------------------------------------------------------------------- unsubscribe

// Public. Matches a token against both Lead and User records and opts whichever it finds out.
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResponse> {
  const { data } = await apiClient.get<UnsubscribeResponse>(`/api/crm/unsubscribe/${token}/`);
  return data;
}

// ----------------------------------------------------------------------------- marketer dashboard

// Marketer only — read-only roll-up across leads, campaigns, lead magnets, enrolments and carts.
export async function getCrmDashboard(): Promise<CrmDashboard> {
  const { data } = await apiClient.get<CrmDashboard>("/api/crm/dashboard/");
  return data;
}
