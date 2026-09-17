// lib/api/testimonials/get-testimonials.ts
import {
  ProgramTestimonial,
  AdminProgramTestimonial,
  CreateProgramTestimonialRequest,
  PatchAdminProgramTestimonialRequest,
} from "@/types/testimonial";
import { PaginatedResponse, unwrapObject } from "@/types/api";
import { apiClient } from "../client";
import { toRequestBody } from "../form-data";

// Public, no auth — confirmed paginated (see the note on ProgramTestimonial in types/testimonial.ts).
export async function getProgramTestimonials(
  slug: string,
): Promise<PaginatedResponse<ProgramTestimonial>> {
  const { data } = await apiClient.get<PaginatedResponse<ProgramTestimonial>>(
    `/api/programs/${slug}/reviews/`,
  );
  return data;
}

// Public, no auth. Goes multipart only when a reviewer_image file is actually attached (same
// JSON-or-multipart convention as programs' cover_image — see lib/api/form-data.ts).
export async function createProgramTestimonial(
  slug: string,
  payload: CreateProgramTestimonialRequest,
): Promise<ProgramTestimonial> {
  const { body, headers } = toRequestBody(payload);
  const { data } = await apiClient.post(
    `/api/programs/${slug}/reviews/`,
    body,
    headers ? { headers } : undefined,
  );
  return unwrapObject<ProgramTestimonial>(data);
}

// Admin/staff only.
export async function getAdminProgramTestimonials(
  page?: number,
): Promise<PaginatedResponse<AdminProgramTestimonial>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminProgramTestimonial>>(
    "/api/programs/admin/reviews/",
    { params: page ? { page } : undefined },
  );
  return data;
}

export async function getAdminProgramTestimonial(id: number): Promise<AdminProgramTestimonial> {
  const { data } = await apiClient.get(`/api/programs/admin/reviews/${id}/`);
  return unwrapObject<AdminProgramTestimonial>(data);
}

export async function patchAdminProgramTestimonial(
  id: number,
  payload: PatchAdminProgramTestimonialRequest,
): Promise<AdminProgramTestimonial> {
  const { data } = await apiClient.patch(`/api/programs/admin/reviews/${id}/`, payload);
  return unwrapObject<AdminProgramTestimonial>(data);
}

export async function deleteAdminProgramTestimonial(id: number): Promise<void> {
  await apiClient.delete(`/api/programs/admin/reviews/${id}/`);
}
