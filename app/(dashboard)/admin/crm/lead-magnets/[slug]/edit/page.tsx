"use client";

import { use } from "react";
import { useLeadMagnet } from "@/hooks/queries/crm";
import { CrmLeadMagnetForm } from "@/components/dashboard/crm/crm-lead-magnet-form";
import { FormSkeleton } from "@/components/ui/skeleton";

export default function AdminEditLeadMagnetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: magnet, isLoading } = useLeadMagnet(slug);

  if (isLoading) return <FormSkeleton fields={5} />;
  if (!magnet) return <p className="text-sm text-gray-400">Lead magnet not found.</p>;
  return <CrmLeadMagnetForm basePath="/admin/crm" magnet={magnet} />;
}
