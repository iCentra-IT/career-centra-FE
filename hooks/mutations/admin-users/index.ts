import { createAdminUser, deleteAdminUser, patchAdminUser, resendAdminUserInvite } from "@/lib/api/admin-users";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import { AdminUser, CreateAdminUserRequest, PatchAdminUserRequest } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, NormalizedError, CreateAdminUserRequest>({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function usePatchAdminUser(id: number) {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, NormalizedError, PatchAdminUserRequest>({
    mutationFn: (payload) => patchAdminUser(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.adminUsers.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useResendAdminUserInvite() {
  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => resendAdminUserInvite(id),
  });
}

// The /all-users/ delete endpoint isn't scoped to one account type, so invalidate both the
// staff/admin list and the learner list rather than trying to guess which one the deleted id
// belonged to.
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLearners.all });
    },
  });
}
