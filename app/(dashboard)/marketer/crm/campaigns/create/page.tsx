"use client";

import { Suspense } from "react";
import { CrmCampaignCompose } from "@/components/dashboard/crm/crm-campaign-compose";

export default function MarketerNewCampaignPage() {
  return (
    <Suspense fallback={null}>
      <CrmCampaignCompose basePath="/marketer/crm" />
    </Suspense>
  );
}
