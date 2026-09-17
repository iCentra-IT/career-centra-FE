// lib/api/testimonials/use-create-testimonial.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProgramTestimonial,
  patchAdminProgramTestimonial,
  deleteAdminProgramTestimonial,
} from "@/lib/api/testimonials";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  ProgramTestimonial,
  AdminProgramTestimonial,
  CreateProgramTestimonialRequest,
  PatchAdminProgramTestimonialRequest,
} from "@/types/testimonial";

export function useCreateProgramTestimonial(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<ProgramTestimonial, NormalizedError, CreateProgramTestimonialRequest>({
    mutationFn: (payload) => createProgramTestimonial(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.program(slug) });
    },
  });
}

export function usePatchAdminProgramTestimonial(id: number) {
  const queryClient = useQueryClient();

  return useMutation<AdminProgramTestimonial, NormalizedError, PatchAdminProgramTestimonialRequest>({
    mutationFn: (payload) => patchAdminProgramTestimonial(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.testimonials.adminDetail(id), data);
      queryClient.invalidateQueries({ queryKey: ["testimonials", "admin"] });
    },
  });
}

export function useDeleteAdminProgramTestimonial() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteAdminProgramTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials", "admin"] });
    },
  });
}
