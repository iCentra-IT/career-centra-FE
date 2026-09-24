// lib/api/referral-partners/get-referral-partners.ts
import {
  ReferralPartner,
  CreateReferralPartnerRequest,
  PatchReferralPartnerRequest,
  OnboardReferralPartnerRequest,
} from "@/types/referral-partner";
import { ApiResponse, unwrapList, unwrapObject } from "@/types/api";
import { apiClient } from "../client";

// Admin/staff only. Modelled as a plain array via unwrapList (tolerates either a bare array or a
// {results: [...]} paginated shape) since this list is short (one row per partnership) and hasn't
// shown pagination fields in the sample the way every catalog-sized list endpoint in this app does.
export async function getReferralPartners(): Promise<ReferralPartner[]> {
  const { data } = await apiClient.get("/api/coupons/admin/partners/");
  return unwrapList<ReferralPartner>(data);
}

export async function getReferralPartner(id: number): Promise<ReferralPartner> {
  const { data } = await apiClient.get(`/api/coupons/admin/partners/${id}/`);
  return unwrapObject<ReferralPartner>(data);
}

export async function createReferralPartner(
  payload: CreateReferralPartnerRequest,
): Promise<ReferralPartner> {
  const { data } = await apiClient.post<ApiResponse<ReferralPartner>>(
    "/api/coupons/admin/partners/",
    payload,
  );
  return unwrapObject<ReferralPartner>(data);
}

export async function patchReferralPartner(
  id: number,
  payload: PatchReferralPartnerRequest,
): Promise<ReferralPartner> {
  const { data } = await apiClient.patch<ApiResponse<ReferralPartner>>(
    `/api/coupons/admin/partners/${id}/`,
    payload,
  );
  return unwrapObject<ReferralPartner>(data);
}

export async function deleteReferralPartner(id: number): Promise<void> {
  await apiClient.delete(`/api/coupons/admin/partners/${id}/`);
}

// Creates the underlying Coupon and its ReferralPartner wrapper in one request.
export async function onboardReferralPartner(
  payload: OnboardReferralPartnerRequest,
): Promise<ReferralPartner> {
  const { data } = await apiClient.post<ApiResponse<ReferralPartner>>(
    "/api/coupons/admin/partners/onboard/",
    payload,
  );
  return unwrapObject<ReferralPartner>(data);
}
