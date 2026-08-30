import { createAdminUser, patchAdminUser } from "@/lib/api/admin-users";
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
