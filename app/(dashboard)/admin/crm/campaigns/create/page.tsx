"use client";

import { Suspense } from "react";
import { CrmCampaignCompose } from "@/components/dashboard/crm/crm-campaign-compose";

export default function AdminNewCampaignPage() {
  return (
    <Suspense fallback={null}>
      <CrmCampaignCompose basePath="/admin/crm" />
    </Suspense>
  );
}
