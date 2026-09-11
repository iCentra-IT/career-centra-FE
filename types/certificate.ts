// lib/api/types/certificate.ts

export type CertificateStatus = "issued" | string; // no full enum given — "issued" confirmed, rest loose

export interface CertificateProgramSummary {
  id: number;
  title: string;
  slug: string;
  program_type: string;
  summary: string;
  cover_image_url: string;
  accreditations: { issuer: string; label: string }[];
}

export interface Certificate {
  id: number;
  certificate_number: string;
  status: CertificateStatus;
  issued_at: string;
  file_url: string;
  program: CertificateProgramSummary;
}
