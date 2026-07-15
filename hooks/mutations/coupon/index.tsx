// lib/api/coupons/use-create-coupon.ts
import {
  createCoupon,
  patchCoupon,
  deleteCoupon,
  validateCoupon,
} from "@/lib/api/coupon";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  Coupon,
  CreateCouponRequest,
  PatchCouponRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from "@/types/coupon";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation<Coupon, NormalizedError, CreateCouponRequest>({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll });
    },
  });
}

export function usePatchCoupon(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Coupon, NormalizedError, PatchCouponRequest>({
    mutationFn: (payload) => patchCoupon(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.coupons.adminDetail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedError, number>({
    mutationFn: (id) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll });
    },
  });
}

export function useValidateCoupon() {
  return useMutation<
    ValidateCouponResponse,
    NormalizedError,
    ValidateCouponRequest
  >({
    mutationFn: validateCoupon,
  });
}
