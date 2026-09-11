// lib/api/orders/index.ts
import { unwrapObject } from "@/types/api";
import type { Order } from "@/types/cart";
import { apiClient } from "../client";

// Owner-scoped — the API returns 404 for anyone else's order.
export async function getOrder(id: number): Promise<Order> {
  const { data } = await apiClient.get(`/api/orders/${id}/`);
  return unwrapObject<Order>(data);
}
