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
  SetCartAddonsRequest,
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

// Replaces the add-on selection for one cohort line. An empty list clears it.
export async function setCartItemAddons(cohortId: number, payload: SetCartAddonsRequest): Promise<Cart> {
  const { data } = await apiClient.put(`/api/cart/items/${cohortId}/addons/`, payload);
  return unwrapObject<Cart>(data);
}

// Adds an add-on to the cart with no cohort attached (e.g. a Question Bank bought on its own).
// addon_id travels in the URL only — confirmed against the live schema, no request body needed.
export async function addStandaloneCartAddon(addonId: number): Promise<Cart> {
  const { data } = await apiClient.post(`/api/cart/standalone-addons/${addonId}/`);
  return unwrapObject<Cart>(data);
}

export async function removeStandaloneCartAddon(addonId: number): Promise<Cart> {
  const { data } = await apiClient.delete(`/api/cart/standalone-addons/${addonId}/`);
  return unwrapObject<Cart>(data);
}
