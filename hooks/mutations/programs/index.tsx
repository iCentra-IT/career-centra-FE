// lib/api/programs/use-create-program.ts
import {
  createProgram,
  updateProgram,
  patchProgram,
  deleteProgram,
} from "@/lib/api/programs";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  Program,
  CreateProgramRequest,
  UpdateProgramRequest,
  PatchProgramRequest,
} from "@/types/programs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation<Program, NormalizedError, CreateProgramRequest>({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
}

export function useUpdateProgram(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<Program, NormalizedError, UpdateProgramRequest>({
    mutationFn: (payload) => updateProgram(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.programs.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
}

export function usePatchProgram(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<Program, NormalizedError, PatchProgramRequest>({
    mutationFn: (payload) => patchProgram(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.programs.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, string>({
    mutationFn: (slug) => deleteProgram(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
}
