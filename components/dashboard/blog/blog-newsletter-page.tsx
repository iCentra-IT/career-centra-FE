"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useNewsletterIssues,
  useNewsletterSubscribers,
  useNewsletterSummary,
} from "@/hooks/queries/blog";
import { useResendNewsletterIssue, useResendSubscriberConfirmation } from "@/hooks/mutations/blog";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";
import { formatOrdinalDateTime } from "@/lib/format";
import type { NewsletterSubscriberStatus } from "@/types/blog";

const ISSUE_COLUMNS = ["Subject", "Post", "Status", "Recipients", "Failed", "Sent", "Action"];
const SUBSCRIBER_COLUMNS = ["Email", "Status", "Source", "Subscribed", "Action"];

function subscriberTone(status: NewsletterSubscriberStatus): "green" | "yellow" | "red" | "gray" {
  if (status === "active") return "green";
  if (status === "pending") return "yellow";
  if (status === "bounced") return "red";
  return "gray";
}

function issueTone(status: string): "green" | "yellow" | "red" | "gray" {
  if (status === "sent") return "green";
  if (status === "pending" || status === "sending") return "yellow";
  if (status === "failed") return "red";
  return "gray";
}

export function BlogNewsletterPage() {
  const { data: summary, isLoading: summaryLoading } = useNewsletterSummary();
  const { data: issues, isLoading: issuesLoading } = useNewsletterIssues();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NewsletterSubscriberStatus | "">("");
  const { data: subscribers, isLoading: subscribersLoading } = useNewsletterSubscribers({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  });
  const resendIssue = useResendNewsletterIssue();
  const resendConfirmation = useResendSubscriberConfirmation();

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Newsletter</h1>
      <p className="mt-1 text-sm text-gray-500">Subscribers and sent issues.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Subscribers" value={summary?.total_subscribers} loading={summaryLoading} />
        <StatCard label="Active" value={summary?.active_subscribers} loading={summaryLoading} />
        <StatCard label="Pending" value={summary?.pending_subscribers} loading={summaryLoading} />
        <StatCard label="Issues Sent" value={summary?.issues_sent} loading={summaryLoading} />
        <StatCard
          label="Last Sent"
          value={summary?.last_sent_at ? formatOrdinalDateTime(summary.last_sent_at) : "—"}
          loading={summaryLoading}
        />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Issues</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {issuesLoading ? (
          <TableSkeleton columns={ISSUE_COLUMNS} />
        ) : !issues || issues.length === 0 ? (
          <EmptyTableState columns={ISSUE_COLUMNS} message="No issues sent yet." />
        ) : (
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {ISSUE_COLUMNS.map((col) => (
                  <th key={col} className="px-5 py-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">{issue.subject}</td>
                  <td className="px-5 py-4 text-gray-600">{issue.post_title || "—"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={issue.status} tone={issueTone(issue.status)} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{issue.recipient_count}</td>
                  <td className="px-5 py-4 text-gray-600">{issue.failed_count}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {issue.sent_at ? formatOrdinalDateTime(issue.sent_at) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {issue.status === "failed" && (
                      <button
                        type="button"
                        disabled={resendIssue.isPending}
                        onClick={() =>
                          resendIssue.mutate(issue.id, {
                            onSuccess: () => toast.success("Issue re-queued."),
                            onError: (err) => toast.error(err.message),
                          })
                        }
                        className="text-xs font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Resend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Subscribers</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as NewsletterSubscriberStatus | "")}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {subscribersLoading ? (
          <TableSkeleton columns={SUBSCRIBER_COLUMNS} />
        ) : !subscribers || subscribers.length === 0 ? (
          <EmptyTableState columns={SUBSCRIBER_COLUMNS} message="No subscribers match yet." />
        ) : (
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {SUBSCRIBER_COLUMNS.map((col) => (
                  <th key={col} className="px-5 py-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900">{subscriber.email}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={subscriber.status_display} tone={subscriberTone(subscriber.status)} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{subscriber.source || "—"}</td>
                  <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(subscriber.subscribed_at)}</td>
                  <td className="px-5 py-4">
                    {subscriber.status === "pending" && (
                      <button
                        type="button"
                        disabled={resendConfirmation.isPending}
                        onClick={() =>
                          resendConfirmation.mutate(subscriber.id, {
                            onSuccess: () => toast.success("Confirmation email resent."),
                            onError: (err) => toast.error(err.message),
                          })
                        }
                        className="text-xs font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Resend Confirmation
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
