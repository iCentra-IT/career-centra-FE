// lib/api/leads/create-lead.ts
import { CreateLeadRequest } from "@/types/lead";
import { apiClient } from "../client";

export async function createLead(payload: CreateLeadRequest): Promise<void> {
  await apiClient.post("/api/leads/", payload);
}
