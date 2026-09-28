import {
  createAdminUser,
  deactivateUser,
  deleteUserPermanently,
  patchAdminUser,
  reactivateUser,
  resendAdminUserInvite,
  resendUserVerification,
} from "@/lib/api/admin-users";
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

// None of the four mutations below are scoped to one account type (they work on any user), so
// each invalidates both the staff/admin list and the learner list rather than trying to guess
// which one the target id belonged to.
function invalidateAllUserLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.adminLearners.all });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deactivateUser(id),
    onSuccess: () => invalidateAllUserLists(queryClient),
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => reactivateUser(id),
    onSuccess: () => invalidateAllUserLists(queryClient),
  });
}

export function useResendUserVerification() {
  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => resendUserVerification(id),
  });
}

export function useDeleteUserPermanently() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteUserPermanently(id),
    onSuccess: () => invalidateAllUserLists(queryClient),
  });
}
