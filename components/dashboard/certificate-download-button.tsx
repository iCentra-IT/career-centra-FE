"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGenerateCertificatePdf } from "@/hooks/mutations/certificates";
import type { Certificate } from "@/types/certificate";

// Resolves a certificate's downloadable file, generating it on demand the first time — the
// generate-pdf endpoint's own response isn't a confirmed shape, so instead of reading it we
// refetch the certificate list and pick up the file_url that lands there.
export function CertificateDownloadButton({
  certificate,
  refetch,
  mode,
  className,
  children,
}: {
  certificate: Certificate;
  refetch: () => Promise<{ data?: Certificate[] }>;
  mode: "view" | "download";
  className: string;
  children: React.ReactNode;
}) {
  const generatePdf = useGenerateCertificatePdf();
  const [resolving, setResolving] = useState(false);

  const openUrl = (url: string) => {
    if (mode === "download") {
      const link = document.createElement("a");
      link.href = url;
      link.download = "";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleClick = async () => {
    if (certificate.file_url) {
      openUrl(certificate.file_url);
      return;
    }

    setResolving(true);
    try {
      await generatePdf.mutateAsync(certificate.id);
      const result = await refetch();
      const fresh = result.data?.find((c) => c.id === certificate.id);
      if (fresh?.file_url) {
        openUrl(fresh.file_url);
      } else {
        toast.error("Your certificate is still being prepared — try again shortly.");
      }
    } catch (err) {
      toast.error((err as { message?: string })?.message || "Couldn't prepare the certificate.");
    } finally {
      setResolving(false);
    }
  };

  const busy = resolving || generatePdf.isPending;

  return (
    <button type="button" onClick={handleClick} disabled={busy} className={className}>
      {busy ? "Preparing…" : children}
    </button>
  );
}
