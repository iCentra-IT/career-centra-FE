// lib/api/auth/use-update-me.ts
import { updateProfile, patchProfile } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import { updateStudentProfile, patchStudentProfile } from "@/lib/api/student";
import { NormalizedError } from "@/types/api";
import {
  UpdateProfileResponse,
  UpdateProfileRequest,
  PatchProfileRequest,
} from "@/types/auth";
import {
  StudentProfile,
  UpdateStudentProfileRequest,
  PatchStudentProfileRequest,
} from "@/types/student";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfileResponse,
    NormalizedError,
    UpdateProfileRequest
  >({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data);
    },
  });
}

export function usePatchProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfileResponse,
    NormalizedError,
    PatchProfileRequest
  >({
    mutationFn: patchProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data);
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    StudentProfile,
    NormalizedError,
    UpdateStudentProfileRequest
  >({
    mutationFn: updateStudentProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.students.profile, data);
    },
  });
}

export function usePatchStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    StudentProfile,
    NormalizedError,
    PatchStudentProfileRequest
  >({
    mutationFn: patchStudentProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.students.profile, data);
    },
  });
}
