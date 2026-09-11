"use client";

import { useCertificates } from "@/hooks/queries/certificates";
import { CertificateDownloadButton } from "@/components/dashboard/certificate-download-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";
import { formatOrdinalDateTime, displayTitle } from "@/lib/format";

const COLUMNS = ["Certificate #", "Program", "Status", "Issued", "Action"];

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  const s = status.toLowerCase();
  if (s === "issued" || s === "active") return "green";
  if (s === "pending" || s === "processing") return "yellow";
  if (s === "revoked" || s === "failed") return "red";
  return "gray";
}

const AdminCertificatesPage = () => {
  const { data: certificates, isLoading, refetch } = useCertificates();

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Certificates</h1>
      <p className="mt-1 text-sm text-gray-500">Certificates issued to learners across the platform.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : !certificates || certificates.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No certificates have been issued yet." />
        ) : (
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-5 py-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {certificate.certificate_number}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {displayTitle(certificate.program?.title) || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge label={certificate.status} tone={statusTone(certificate.status)} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {formatOrdinalDateTime(certificate.issued_at)}
                  </td>
                  <td className="px-5 py-4">
                    <CertificateDownloadButton
                      certificate={certificate}
                      refetch={refetch}
                      mode="download"
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Download PDF
                    </CertificateDownloadButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCertificatesPage;
