"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCrmLeads } from "@/hooks/queries/crm";
import { useDeleteCrmLead } from "@/hooks/mutations/crm";
import { exportCrmLeads } from "@/lib/api/crm";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatShortDate } from "@/lib/format";
import { crmLeadName } from "@/lib/crm";
import type { CrmLead, LeadAudienceType, LeadFilters, LeadPlatform, LeadSource } from "@/types/crm";

const COLUMNS = ["Lead", "Source", "Platform", "Audience", "Intent", "Status", "Synced", "Follow-up", "Action"];

const SOURCE_OPTIONS: { value: LeadSource | ""; label: string }[] = [
  { value: "", label: "All sources" },
  { value: "enquiry", label: "Enquiry" },
  { value: "newsletter", label: "Newsletter" },
  { value: "waitlist", label: "Waitlist" },
  { value: "lead_magnet", label: "Lead Magnet" },
  { value: "external", label: "External" },
];

const PLATFORM_OPTIONS: { value: LeadPlatform | ""; label: string }[] = [
  { value: "", label: "All platforms" },
  { value: "learning", label: "learning.icentra.com" },
  { value: "careercentra", label: "careercentra.icentra.com" },
];

const AUDIENCE_OPTIONS: { value: LeadAudienceType | ""; label: string }[] = [
  { value: "", label: "All audiences" },
  { value: "individual", label: "Individual" },
  { value: "enterprise", label: "Corporate" },
  { value: "executive", label: "Executive" },
];

const selectClass =
  "rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

function intentTone(intent: CrmLead["intent_level"]): "green" | "yellow" | "gray" | "red" {
  if (intent === "high") return "red";
  if (intent === "mid") return "yellow";
  return "gray";
}

export function CrmLeadsPage({ basePath }: { basePath: string }) {
  const [filters, setFilters] = useState<LeadFilters>({ page: 1 });
  const [syncedFilter, setSyncedFilter] = useState<"" | "yes" | "no">("");
  const [deleteTarget, setDeleteTarget] = useState<CrmLead | null>(null);
  const [exporting, setExporting] = useState(false);

  const effectiveFilters: LeadFilters = {
    ...filters,
    crm_synced: syncedFilter === "" ? undefined : syncedFilter === "yes",
  };
  const { data, isLoading, isFetching } = useCrmLeads(effectiveFilters);
  const deleteLead = useDeleteCrmLead();

  const leads = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;

  const update = (patch: Partial<LeadFilters>) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportCrmLeads(effectiveFilters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crm-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteLead.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Lead deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enquiries, newsletter signups and lead-magnet downloads from the public site.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={handleExport} loading={exporting} className="w-auto px-5">
            Export CSV
          </Button>
          <Link
            href={`${basePath}/leads/create`}
            className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
          >
            Add Lead
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={filters.search ?? ""}
          onChange={(e) => update({ search: e.target.value || undefined })}
          placeholder="Search name, email, company…"
          className="min-w-64 flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <input
          value={filters.status ?? ""}
          onChange={(e) => update({ status: e.target.value || undefined })}
          placeholder="Status (e.g. new)"
          className={`${selectClass} w-40`}
        />
        <select
          value={filters.source ?? ""}
          onChange={(e) => update({ source: (e.target.value || undefined) as LeadSource | undefined })}
          className={selectClass}
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.platform ?? ""}
          onChange={(e) => update({ platform: (e.target.value || undefined) as LeadPlatform | undefined })}
          className={selectClass}
        >
          {PLATFORM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.audience_type ?? ""}
          onChange={(e) =>
            update({ audience_type: (e.target.value || undefined) as LeadAudienceType | undefined })
          }
          className={selectClass}
        >
          {AUDIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={syncedFilter}
          onChange={(e) => {
            setSyncedFilter(e.target.value as "" | "yes" | "no");
            setFilters((prev) => ({ ...prev, page: 1 }));
          }}
          className={selectClass}
        >
          <option value="">Any CRM sync</option>
          <option value="yes">Synced to CRM</option>
          <option value="no">Not synced</option>
        </select>
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
          <tbody className={isFetching && !isLoading ? "opacity-60" : undefined}>
            {isLoading && <TableSkeleton columns={COLUMNS} />}
            {!isLoading && leads.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No leads match these filters.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4">
                  <Link href={`${basePath}/leads/${lead.id}`} className="font-medium text-gray-900 hover:underline">
                    {crmLeadName(lead)}
                  </Link>
                  <p className="text-xs text-gray-400">{lead.email}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{lead.source}</td>
                <td className="px-5 py-4 text-gray-600">{lead.platform}</td>
                <td className="px-5 py-4 text-gray-600">{lead.audience_type}</td>
                <td className="px-5 py-4">
                  {lead.intent_level ? (
                    <StatusBadge label={lead.intent_level} tone={intentTone(lead.intent_level)} />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{lead.status}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={lead.crm_synced ? "Synced" : "Pending"} tone={lead.crm_synced ? "green" : "gray"} />
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {lead.next_follow_up_date ? formatShortDate(lead.next_follow_up_date) : "—"}
                </td>
                <td className="px-5 py-4">
                  <ActionsMenu
                    items={[
                      { label: "View", onClick: () => (window.location.href = `${basePath}/leads/${lead.id}`) },
                      { label: "Edit", onClick: () => (window.location.href = `${basePath}/leads/${lead.id}/edit`) },
                      { label: "Delete", tone: "danger", onClick: () => setDeleteTarget(lead) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination
            page={filters.page ?? 1}
            totalPages={totalPages}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete lead"
        description={`Delete ${deleteTarget ? crmLeadName(deleteTarget) : "this lead"}? Their notes and tasks go with them.`}
        loading={deleteLead.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
