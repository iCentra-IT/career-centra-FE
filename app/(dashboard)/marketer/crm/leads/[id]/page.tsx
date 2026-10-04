"use client";

import { use } from "react";
import { CrmLeadDetailPage } from "@/components/dashboard/crm/crm-lead-detail-page";

export default function MarketerLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CrmLeadDetailPage basePath="/marketer/crm" leadId={id} />;
}
