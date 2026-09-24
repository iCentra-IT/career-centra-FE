// lib/api/referral-partners/use-referral-partners.ts
import { useQuery } from "@tanstack/react-query";
import { getReferralPartners, getReferralPartner } from "@/lib/api/referral-partner";
import { queryKeys } from "@/lib/api/query-keys";

export function useReferralPartners() {
  return useQuery({
    queryKey: queryKeys.referralPartners.adminAll,
    queryFn: getReferralPartners,
  });
}

export function useReferralPartner(id: number) {
  return useQuery({
    queryKey: queryKeys.referralPartners.adminDetail(id),
    queryFn: () => getReferralPartner(id),
    enabled: !!id,
  });
}
