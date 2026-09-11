import { useQuery } from "@tanstack/react-query";
import { getCertificates } from "@/lib/api/certificates";
import { queryKeys } from "@/lib/api/query-keys";

export function useCertificates() {
  return useQuery({
    queryKey: queryKeys.certificates.all,
    queryFn: getCertificates,
    staleTime: 60 * 1000,
  });
}
