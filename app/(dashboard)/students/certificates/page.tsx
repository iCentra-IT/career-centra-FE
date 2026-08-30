"use client";

import { useStudentCertificates } from "@/hooks/queries/students";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { displayTitle, formatShortDate } from "@/lib/format";

function AwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7.5" r="4" stroke="#0c236c" strokeWidth="1.5" />
      <path d="M7.5 10.8L6.5 17l3.5-2 3.5 2-1-6.2" stroke="#0c236c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_MAP: Record<string, { label: string; tone: "green" | "yellow" | "red" | "gray" }> = {
  issued: { label: "Approved", tone: "green" },
  pending: { label: "Pending", tone: "yellow" },
  revoked: { label: "Revoked", tone: "red" },
};

const CertificatesPage = () => {
  const { data, isLoading } = useStudentCertificates();
  const certificates = data?.certificates ?? [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Certificates</h1>
      <p className="mt-1 text-sm text-gray-500">Download and verify your earned certifications.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {isLoading && <CardGridSkeleton count={4} />}
        {!isLoading && certificates.length === 0 && (
          <p className="text-sm text-gray-400">No certificates earned yet.</p>
        )}
        {certificates.map((cert) => {
          const status = STATUS_MAP[cert.status] ?? { label: capitalize(cert.status), tone: "gray" as const };

          return (
            <div key={cert.id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <AwardIcon />
                </div>
                <StatusBadge label={status.label} tone={status.tone} />
              </div>

              <span className="mt-4 inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                {cert.program.program_type}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {displayTitle(cert.program.title)}
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Credential ID</p>
                  <p className="mt-1 font-medium text-gray-900">{cert.certificate_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Issued</p>
                  <p className="mt-1 font-medium text-gray-900">{formatShortDate(cert.issued_at)}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3 border-t border-gray-50 pt-4">
                {cert.file_url ? (
                  <>
                    <a
                      href={cert.file_url}
                      download
                      className="rounded-full bg-main px-5 py-2 text-sm font-medium text-white hover:bg-deep-blue"
                    >
                      Download
                    </a>
                    <a
                      href={cert.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-secondary/10 px-5 py-2 text-sm font-medium text-secondary hover:bg-secondary/20"
                    >
                      View
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-gray-400" title="Certificate file not available yet">
                    Certificate file not available yet
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default CertificatesPage;
