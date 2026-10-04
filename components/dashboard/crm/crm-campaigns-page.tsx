"use client";

import Link from "next/link";
import { useCampaigns } from "@/hooks/queries/crm";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatOrdinalDateTime } from "@/lib/format";

const COLUMNS = ["Subject", "Author", "Status", "Sent", "Recipients", "Failed"];

export function CrmCampaignsPage({ basePath }: { basePath: string }) {
  const { data, isLoading } = useCampaigns();
  const campaigns = data?.results ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            One-off broadcast emails. Sending queues the email immediately — there is no scheduling or draft step.
          </p>
        </div>
        <Link
          href={`${basePath}/campaigns/create`}
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          New Campaign
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
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
            {isLoading && <TableSkeleton columns={COLUMNS} />}
            {!isLoading && campaigns.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No campaigns sent yet.
                </td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4 font-medium text-gray-900">{c.subject}</td>
                <td className="px-5 py-4 text-gray-600">{c.author.full_name || c.author.email}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={c.status} tone="gray" />
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {c.sent_at ? formatOrdinalDateTime(c.sent_at) : "—"}
                </td>
                <td className="px-5 py-4 text-gray-600">{c.recipient_count}</td>
                <td className="px-5 py-4 text-gray-600">{c.failed_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
