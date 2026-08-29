// lib/api/career-paths/use-create-career-path.ts
import { createCareerPath, updateCareerPath, patchCareerPath, deleteCareerPath } from "@/lib/api/career-paths";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  CareerPathDetail,
  CreateCareerPathRequest,
  UpdateCareerPathRequest,
  PatchCareerPathRequest,
} from "@/types/career-paths";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCareerPath() {
  const queryClient = useQueryClient();

  return useMutation<CareerPathDetail, NormalizedError, CreateCareerPathRequest>({
    mutationFn: createCareerPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.careerPaths.all });
    },
  });
}

export function useUpdateCareerPath(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<CareerPathDetail, NormalizedError, UpdateCareerPathRequest>({
    mutationFn: (payload) => updateCareerPath(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.careerPaths.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.careerPaths.all });
    },
  });
}

export function usePatchCareerPath(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<CareerPathDetail, NormalizedError, PatchCareerPathRequest>({
    mutationFn: (payload) => patchCareerPath(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.careerPaths.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.careerPaths.all });
    },
  });
}

export function useDeleteCareerPath() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, string>({
    mutationFn: (slug) => deleteCareerPath(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.careerPaths.all });
    },
  });
}
