// lib/api/certificates/index.ts
import { unwrapList } from "@/types/api";
import { Certificate } from "@/types/certificate";
import { apiClient } from "../client";

// Confirmed real shape: a bare array, not wrapped/paginated.
export async function getCertificates(): Promise<Certificate[]> {
  const { data } = await apiClient.get("/api/certificates/");
  return unwrapList<Certificate>(data);
}

// GET, not POST — kicks off (re)generating the certificate's PDF. The sample response is a
// Swagger placeholder ({additionalProp1: "string", ...}), not a confirmed shape, so callers
// shouldn't trust its body for a file_url — refetch the certificate list afterwards instead.
export async function generateCertificatePdf(certificateId: number): Promise<unknown> {
  const { data } = await apiClient.get(`/api/certificates/${certificateId}/generate-pdf/`);
  return data;
}

// Issues a certificate for a confirmed enrollment.
export async function issueCertificate(enrollmentId: number): Promise<Certificate> {
  const { data } = await apiClient.post<Certificate>(`/api/certificates/issue/${enrollmentId}/`);
  return data;
}
