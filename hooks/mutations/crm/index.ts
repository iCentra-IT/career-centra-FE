import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  captureCrmLead,
  createCrmLead,
  createCrmLeadNote,
  createCrmTask,
  createLeadMagnet,
  deleteCampaign,
  deleteCrmLead,
  deleteCrmLeadNote,
  deleteCrmTask,
  deleteLeadMagnet,
  downloadLeadMagnet,
  patchCrmLead,
  patchCrmLeadNote,
  patchCrmTask,
  patchLeadMagnet,
  sendCampaign,
  unsubscribeByToken,
} from "@/lib/api/crm";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import type {
  CaptureLeadRequest,
  CaptureLeadResponse,
  Campaign,
  CrmLead,
  CrmLeadNote,
  CrmLeadNoteWriteRequest,
  CrmLeadWriteRequest,
  CrmTask,
  CrmTaskWriteRequest,
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

// Invalidate every CRM list at once — a lead change can affect the list, its detail, and the
// task/note views that reference it, and this keeps all of them honest without per-call wiring.
function useInvalidateCrm() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["crm"] });
}

export function useCreateCrmLead() {
  const invalidate = useInvalidateCrm();
  return useMutation<CrmLead, NormalizedError, CrmLeadWriteRequest>({
    mutationFn: createCrmLead,
    onSuccess: invalidate,
  });
}

export function usePatchCrmLead(id: string) {
  const invalidate = useInvalidateCrm();
  return useMutation<CrmLead, NormalizedError, PatchCrmLeadRequest>({
    mutationFn: (payload) => patchCrmLead(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCrmLead() {
  const invalidate = useInvalidateCrm();
  return useMutation<void, NormalizedError, string>({
    mutationFn: deleteCrmLead,
    onSuccess: invalidate,
  });
}

// Public capture — no invalidation, nothing staff-facing is on screen when it runs.
export function useCaptureCrmLead() {
  return useMutation<CaptureLeadResponse, NormalizedError, CaptureLeadRequest>({
    mutationFn: captureCrmLead,
  });
}

export function useCreateCrmLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation<CrmLeadNote, NormalizedError, string>({
    mutationFn: (note) => createCrmLeadNote({ lead: leadId, note } satisfies CrmLeadNoteWriteRequest),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.crm.notes(leadId) }),
  });
}

export function usePatchCrmLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation<CrmLeadNote, NormalizedError, { id: string; note: string }>({
    mutationFn: ({ id, note }) => patchCrmLeadNote(id, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.crm.notes(leadId) }),
  });
}

export function useDeleteCrmLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, NormalizedError, string>({
    mutationFn: deleteCrmLeadNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.crm.notes(leadId) }),
  });
}

export function useCreateCrmTask() {
  const invalidate = useInvalidateCrm();
  return useMutation<CrmTask, NormalizedError, CrmTaskWriteRequest>({
    mutationFn: createCrmTask,
    onSuccess: invalidate,
  });
}

export function usePatchCrmTask() {
  const invalidate = useInvalidateCrm();
  return useMutation<CrmTask, NormalizedError, { id: string; payload: PatchCrmTaskRequest }>({
    mutationFn: ({ id, payload }) => patchCrmTask(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCrmTask() {
  const invalidate = useInvalidateCrm();
  return useMutation<void, NormalizedError, string>({
    mutationFn: deleteCrmTask,
    onSuccess: invalidate,
  });
}

export function useCreateLeadMagnet() {
  const invalidate = useInvalidateCrm();
  return useMutation<LeadMagnet, NormalizedError, LeadMagnetWriteRequest>({
    mutationFn: createLeadMagnet,
    onSuccess: invalidate,
  });
}

export function usePatchLeadMagnet(slug: string) {
  const invalidate = useInvalidateCrm();
  return useMutation<LeadMagnet, NormalizedError, PatchLeadMagnetRequest>({
    mutationFn: (payload) => patchLeadMagnet(slug, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteLeadMagnet() {
  const invalidate = useInvalidateCrm();
  return useMutation<void, NormalizedError, string>({
    mutationFn: deleteLeadMagnet,
    onSuccess: invalidate,
  });
}

// Public email-capture modal's submit — the caller opens the returned file_url immediately.
export function useDownloadLeadMagnet(slug: string) {
  return useMutation<LeadMagnetDownloadResponse, NormalizedError, LeadMagnetDownloadRequest>({
    mutationFn: (payload) => downloadLeadMagnet(slug, payload),
  });
}

export function useSendCampaign() {
  const invalidate = useInvalidateCrm();
  return useMutation<Campaign, NormalizedError, SendCampaignRequest>({
    mutationFn: sendCampaign,
    onSuccess: invalidate,
  });
}

export function useDeleteCampaign() {
  const invalidate = useInvalidateCrm();
  return useMutation<void, NormalizedError, string>({
    mutationFn: deleteCampaign,
    onSuccess: invalidate,
  });
}

export function useUnsubscribe() {
  return useMutation<UnsubscribeResponse, NormalizedError, string>({
    mutationFn: unsubscribeByToken,
  });
}
