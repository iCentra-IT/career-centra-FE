import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateCertificatePdf, issueCertificate } from "@/lib/api/certificates";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import { Certificate } from "@/types/certificate";

// The response body isn't a confirmed shape (Swagger placeholder) — callers should refetch the
// certificate list afterwards to pick up the generated file_url rather than reading this result.
export function useGenerateCertificatePdf() {
  return useMutation<unknown, NormalizedError, number>({
    mutationFn: (certificateId) => generateCertificatePdf(certificateId),
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation<Certificate, NormalizedError, number>({
    mutationFn: (enrollmentId) => issueCertificate(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEnrollments.all() });
    },
  });
}
