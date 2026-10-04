"use client";

import { use } from "react";
import { useCrmLead } from "@/hooks/queries/crm";
import { CrmLeadForm } from "@/components/dashboard/crm/crm-lead-form";
import { FormSkeleton } from "@/components/ui/skeleton";

export default function MarketerEditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: lead, isLoading } = useCrmLead(id);

  if (isLoading) return <FormSkeleton fields={8} />;
  if (!lead) return <p className="text-sm text-gray-400">Lead not found.</p>;
  return <CrmLeadForm basePath="/marketer/crm" lead={lead} />;
}
