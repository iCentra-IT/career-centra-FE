// lib/api/leads/use-create-lead.ts
import { createLead } from "@/lib/api/leads";
import { NormalizedError } from "@/types/api";
import { CreateLeadRequest } from "@/types/lead";
import { useMutation } from "@tanstack/react-query";

export function useCreateLead() {
  return useMutation<void, NormalizedError, CreateLeadRequest>({
    mutationFn: createLead,
  });
}
