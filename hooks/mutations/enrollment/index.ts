import { verifyCheckout, initiateCheckout } from "@/lib/api/enrolment";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import { CheckoutVerifyResponse, CheckoutVerifyRequest, CheckoutInitiateResponse, CheckoutInitiateRequest } from "@/types/enrollment";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useVerifyCheckout() {
  const queryClient = useQueryClient();

  return useMutation<CheckoutVerifyResponse, NormalizedError, CheckoutVerifyRequest>({
    mutationFn: verifyCheckout,
    onSuccess: () => {
      // enrollment status likely changed pending -> active, refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all() });
    },
  });
}

export function useInitiateCheckout() {
  return useMutation<CheckoutInitiateResponse, NormalizedError, CheckoutInitiateRequest>({
    mutationFn: initiateCheckout,
    // once we know the real shape, onSuccess likely does:
    // window.location.href = data.authorization_url
  });
}

