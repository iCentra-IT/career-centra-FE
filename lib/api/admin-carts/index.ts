// lib/api/admin-carts/index.ts
import { apiClient } from "../client";
import { ApiResponse, PaginatedResponse, unwrapObject } from "@/types/api";
import type { AdminCartSummary, AdminUserCart } from "@/types/admin-cart";

export async function getAdminCarts(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<AdminCartSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminCartSummary>>("/api/admin/carts/", { params });
  return data;
}

// Walks every page so a caller can join carts onto a full learner list. Stops on the first
// page that reports no `next`, with a hard cap so a bad response can't loop forever.
export async function getAllAdminCarts(): Promise<AdminCartSummary[]> {
  const all: AdminCartSummary[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await getAdminCarts({ page, page_size: 100 });
    all.push(...res.results);
    if (!res.next) break;
  }
  return all;
}

export async function getAdminUserCart(userId: number): Promise<AdminUserCart> {
  const { data } = await apiClient.get<ApiResponse<AdminUserCart> | AdminUserCart>(`/api/admin/carts/${userId}/`);
  return unwrapObject<AdminUserCart>(data);
}
