// lib/api/exchange-rates/index.ts
import { PaginatedResponse } from "@/types/api";
import {
  CreateExchangeRateRequest,
  ExchangeRate,
  PatchExchangeRateRequest,
} from "@/types/exchange-rate";
import { apiClient } from "../client";

export async function getExchangeRates(
  filters?: { page?: number },
): Promise<PaginatedResponse<ExchangeRate>> {
  const { data } = await apiClient.get<PaginatedResponse<ExchangeRate>>(
    "/api/admin/exchange-rates/",
    { params: filters },
  );
  return data;
}

export async function getExchangeRate(id: number): Promise<ExchangeRate> {
  const { data } = await apiClient.get<ExchangeRate>(`/api/admin/exchange-rates/${id}/`);
  return data;
}

export async function createExchangeRate(
  payload: CreateExchangeRateRequest,
): Promise<ExchangeRate> {
  const { data } = await apiClient.post<ExchangeRate>("/api/admin/exchange-rates/", payload);
  return data;
}

export async function patchExchangeRate(
  id: number,
  payload: PatchExchangeRateRequest,
): Promise<ExchangeRate> {
  const { data } = await apiClient.patch<ExchangeRate>(
    `/api/admin/exchange-rates/${id}/`,
    payload,
  );
  return data;
}

export async function deleteExchangeRate(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/exchange-rates/${id}/`);
}
