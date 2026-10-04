"use client";

import { use } from "react";
import { CrmLeadDetailPage } from "@/components/dashboard/crm/crm-lead-detail-page";

export default function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CrmLeadDetailPage basePath="/admin/crm" leadId={id} />;
}
