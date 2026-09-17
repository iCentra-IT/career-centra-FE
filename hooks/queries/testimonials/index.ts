// lib/api/testimonials/use-testimonials.ts
import { useQuery } from "@tanstack/react-query";
import { getProgramTestimonials, getAdminProgramTestimonials, getAdminProgramTestimonial } from "@/lib/api/testimonials";
import { queryKeys } from "@/lib/api/query-keys";

// Public — no auth required, so no `enabled` gate on an access token.
export function useProgramTestimonials(slug: string) {
  return useQuery({
    queryKey: queryKeys.testimonials.program(slug),
    queryFn: () => getProgramTestimonials(slug),
    enabled: !!slug,
  });
}

export function useAdminProgramTestimonials(page?: number) {
  return useQuery({
    queryKey: queryKeys.testimonials.adminAll(page),
    queryFn: () => getAdminProgramTestimonials(page),
  });
}

export function useAdminProgramTestimonial(id: number) {
  return useQuery({
    queryKey: queryKeys.testimonials.adminDetail(id),
    queryFn: () => getAdminProgramTestimonial(id),
    enabled: !!id,
  });
}
