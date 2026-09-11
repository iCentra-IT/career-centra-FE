// lib/api/cart/index.ts
import { unwrapObject } from "@/types/api";
import type {
  AddToCartRequest,
  Cart,
  CartCheckoutRequest,
  CartCheckoutResponse,
  CartCountResponse,
  MergeGuestCartRequest,
  MergeGuestCartResponse,
} from "@/types/cart";
import { apiClient } from "../client";

export async function getCart(params?: {
  currency?: string;
  coupon?: string;
}): Promise<Cart> {
  const { data } = await apiClient.get("/api/cart/", { params });
  return unwrapObject<Cart>(data);
}

export async function addCartItem(payload: AddToCartRequest): Promise<Cart> {
  const { data } = await apiClient.post("/api/cart/", payload);
  return unwrapObject<Cart>(data);
}

export async function removeCartItem(cohortId: number): Promise<Cart> {
  const { data } = await apiClient.delete(`/api/cart/items/${cohortId}/`);
  return unwrapObject<Cart>(data);
}

export async function emptyCart(): Promise<Cart> {
  const { data } = await apiClient.delete("/api/cart/");
  return unwrapObject<Cart>(data);
}

export async function getCartCount(): Promise<number> {
  const { data } = await apiClient.get("/api/cart/count/");
  return unwrapObject<CartCountResponse>(data)?.count ?? 0;
}

export async function mergeGuestCart(
  payload: MergeGuestCartRequest,
): Promise<MergeGuestCartResponse> {
  const { data } = await apiClient.post("/api/cart/merge/", payload);
  return unwrapObject<MergeGuestCartResponse>(data);
}

export async function checkoutCart(
  payload: CartCheckoutRequest,
): Promise<CartCheckoutResponse> {
  const { data } = await apiClient.post("/api/cart/checkout/", payload);
  return unwrapObject<CartCheckoutResponse>(data);
}
