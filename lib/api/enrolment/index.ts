// lib/api/enrollments/get-enrollments.ts
import { PaginatedResponse } from "@/types/api";
import {
  EnrollmentListItem,
  Enrollment,
  EnrollmentReceipt,
  CheckoutInitiateRequest,
  CheckoutInitiateResponse,
  CheckoutVerifyRequest,
  CheckoutVerifyResponse,
} from "@/types/enrollment";
import { apiClient } from "../client";

export async function initiateCheckout(
  payload: CheckoutInitiateRequest,
): Promise<CheckoutInitiateResponse> {
  const { data } = await apiClient.post<CheckoutInitiateResponse>(
    "/api/checkout/initiate/",
    payload,
  );
  return data;
}

export async function verifyCheckout(
  payload: CheckoutVerifyRequest,
): Promise<CheckoutVerifyResponse> {
  const { data } = await apiClient.post<CheckoutVerifyResponse>(
    "/api/checkout/verify/",
    payload,
  );
  return data;
}

export async function getEnrollments(params?: {
  page?: number;
}): Promise<PaginatedResponse<EnrollmentListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<EnrollmentListItem>>(
    "/api/enrollments/",
    { params },
  );
  return data;
}

export async function getEnrollment(id: number): Promise<Enrollment> {
  const { data } = await apiClient.get<Enrollment>(`/api/enrollments/${id}/`);
  return data;
}

export async function getEnrollmentReceipt(
  id: number,
): Promise<EnrollmentReceipt> {
  const { data } = await apiClient.get<EnrollmentReceipt>(
    `/api/enrollments/${id}/receipt/`,
  );
  return data;
}
