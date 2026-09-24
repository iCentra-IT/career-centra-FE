// lib/api/referral-partners/use-create-referral-partner.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReferralPartner,
  patchReferralPartner,
  deleteReferralPartner,
  onboardReferralPartner,
} from "@/lib/api/referral-partner";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  ReferralPartner,
  CreateReferralPartnerRequest,
  PatchReferralPartnerRequest,
  OnboardReferralPartnerRequest,
} from "@/types/referral-partner";

export function useCreateReferralPartner() {
  const queryClient = useQueryClient();
  return useMutation<ReferralPartner, NormalizedError, CreateReferralPartnerRequest>({
    mutationFn: createReferralPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referralPartners.adminAll });
    },
  });
}

export function useOnboardReferralPartner() {
  const queryClient = useQueryClient();
  return useMutation<ReferralPartner, NormalizedError, OnboardReferralPartnerRequest>({
    mutationFn: onboardReferralPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referralPartners.adminAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll });
    },
  });
}

export function usePatchReferralPartner(id: number) {
  const queryClient = useQueryClient();
  return useMutation<ReferralPartner, NormalizedError, PatchReferralPartnerRequest>({
    mutationFn: (payload) => patchReferralPartner(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.referralPartners.adminDetail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.referralPartners.adminAll });
    },
  });
}

export function useDeleteReferralPartner() {
  const queryClient = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteReferralPartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referralPartners.adminAll });
    },
  });
}
