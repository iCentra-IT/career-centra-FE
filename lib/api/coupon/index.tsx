// lib/api/coupons/get-coupons.ts
import {
  Coupon,
  CreateCouponRequest,
  PatchCouponRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from "@/types/coupon";
import { ApiResponse } from "@/types/api";
import { apiClient } from "../client";

export async function getCoupons(): Promise<Coupon[]> {
  const { data } = await apiClient.get<ApiResponse<Coupon[]>>("/api/coupons/admin/coupons/");
  return data.data;
}

export async function getCoupon(id: number): Promise<Coupon> {
  const { data } = await apiClient.get<ApiResponse<Coupon>>(
    `/api/coupons/admin/coupons/${id}/`,
  );
  return data.data;
}

export async function createCoupon(
  payload: CreateCouponRequest,
): Promise<Coupon> {
  const { data } = await apiClient.post<ApiResponse<Coupon>>(
    "/api/coupons/admin/coupons/",
    payload,
  );
  return data.data;
}

export async function patchCoupon(
  id: number,
  payload: PatchCouponRequest,
): Promise<Coupon> {
  const { data } = await apiClient.patch<ApiResponse<Coupon>>(
    `/api/coupons/admin/coupons/${id}/`,
    payload,
  );
  return data.data;
}

export async function deleteCoupon(id: number): Promise<void> {
  await apiClient.delete(`/api/coupons/admin/coupons/${id}/`);
}

//students usage
export async function validateCoupon(
  payload: ValidateCouponRequest,
): Promise<ValidateCouponResponse> {
  const { data } = await apiClient.post<ValidateCouponResponse>(
    "/api/coupons/coupons/validate/",
    payload,
  );
  return data;
}
