"use client";

import Link from "next/link";
import { useCrmDashboard } from "@/hooks/queries/crm";
import { useAuthStore } from "@/lib/store/authStore";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { formatOrdinalDateTime, formatShortDate } from "@/lib/format";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {action && (
          <Link href={action.href} className="text-xs font-medium text-secondary hover:underline">
            {action.label} →
          </Link>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">{children}</p>;
}

function campaignTone(status: string): "green" | "yellow" | "red" | "gray" {
  const s = status.toLowerCase();
  if (s === "sent" || s === "completed") return "green";
  if (s === "queued" || s === "sending") return "yellow";
  if (s === "failed") return "red";
  return "gray";
}

export function CrmDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useCrmDashboard();

  if (isLoading) return <ListRowSkeleton rows={6} />;
  if (!data) return <Empty>Couldn&apos;t load the dashboard. Try refreshing the page.</Empty>;

  const { leads, follow_up_tasks: tasks, campaigns_and_newsletter: camp, referral_partners_and_lead_magnets: ref, enrollment_funnel: funnel, cart_activity: carts } = data;
  const statusEntries = Object.entries(leads.by_status).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(1, ...statusEntries.map(([, n]) => n));
  const conversion =
    funnel.checkouts_initiated_7d > 0
      ? Math.round((funnel.checkouts_confirmed_7d / funnel.checkouts_initiated_7d) * 100)
      : null;
  const needsAttention = tasks.overdue_count > 0 || tasks.due_today_count > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">
            {greeting()}
            {user?.first_name ? `, ${user.first_name}` : ""}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-gray-900">CRM Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/marketer/crm/leads/create"
            className="rounded-full bg-main px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue"
          >
            + New Lead
          </Link>
          <Link
            href="/marketer/crm/campaigns/create"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            New Campaign
          </Link>
          <Link
            href="/marketer/crm/lead-magnets/create"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            New Lead Magnet
          </Link>
        </div>
      </header>

      {needsAttention && (
        <Link
          href="/marketer/crm/tasks"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 hover:bg-amber-100/60"
        >
          <p className="text-sm font-medium text-amber-900">
            {tasks.overdue_count > 0 && <>{tasks.overdue_count} overdue follow-up{tasks.overdue_count === 1 ? "" : "s"}</>}
            {tasks.overdue_count > 0 && tasks.due_today_count > 0 && " · "}
            {tasks.due_today_count > 0 && <>{tasks.due_today_count} due today</>}
          </p>
          <span className="text-xs font-medium text-amber-800">Review tasks →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Leads" value={leads.total_leads} note={`${leads.new_leads_7d} new in the last 7 days`} />
        <StatCard label="Open Tasks" value={tasks.pending_count} note={`${tasks.due_today_count} due today`} />
        <StatCard label="Active Subscribers" value={camp.active_subscribers} note={`${camp.new_subscribers_7d} new in 7 days`} />
        <StatCard label="Confirmed Enrolments" value={funnel.confirmed_enrollments_total} note={`${funnel.new_enrollments_7d} new in 7 days`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Panel title="Leads by Status" action={{ label: "All leads", href: "/marketer/crm/leads" }}>
            {statusEntries.length === 0 ? (
              <Empty>No leads yet. Captured enquiries will appear here.</Empty>
            ) : (
              <ul className="flex flex-col gap-3">
                {statusEntries.map(([status, count]) => (
                  <li key={status} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm">
                    <span className="capitalize text-gray-600">{status.replace(/_/g, " ")}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <span
                        className="block h-full rounded-full bg-secondary"
                        style={{ width: `${(count / maxStatus) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-medium text-gray-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent Campaigns" action={{ label: "All campaigns", href: "/marketer/crm/campaigns" }}>
            <p className="mb-4 text-xs text-gray-400">{camp.campaigns_sent_last_30_days} sent in the last 30 days</p>
            {camp.recent_campaigns.length === 0 ? (
              <Empty>No campaigns sent yet.</Empty>
            ) : (
              <ul className="divide-y divide-gray-100">
                {camp.recent_campaigns.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{c.subject}</p>
                      <p className="text-xs text-gray-400">
                        {c.sent_at ? formatOrdinalDateTime(c.sent_at) : "Not sent"} · {c.recipient_count} recipients
                      </p>
                    </div>
                    <StatusBadge label={c.status} tone={campaignTone(c.status)} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Cart Activity" action={{ label: "Learners", href: "/marketer/learners" }}>
            <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4 text-center">
              <div>
                <p className="text-xl font-semibold text-gray-900">{carts.overview.carts_with_items}</p>
                <p className="text-xs text-gray-400">Carts with items</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{carts.overview.abandoned_carts}</p>
                <p className="text-xs text-gray-400">Abandoned</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{carts.overview.total_items_in_carts}</p>
                <p className="text-xs text-gray-400">Items in carts</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Most-carted cohorts</p>
                {carts.top_cohorts.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">Nothing in carts right now.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-gray-100">
                    {carts.top_cohorts.map((row) => (
                      <li key={row.cohort.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-900">Starts {formatShortDate(row.cohort.starts_on)}</span>
                        <span className="text-gray-500">{row.in_cart_count} in carts</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recent activity</p>
                {carts.recent_activity.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">No recent activity.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-gray-100">
                    {carts.recent_activity.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="min-w-0 truncate text-gray-900">{a.user.full_name || a.user.email}</span>
                        <span className="shrink-0 text-xs text-gray-400">
                          {a.item_count} item{a.item_count === 1 ? "" : "s"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Enrolment Funnel" action={{ label: "Learners", href: "/marketer/learners" }}>
            <p className="text-xs text-gray-400">Last 7 days</p>
            <div className="mt-3 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Checkouts started</span>
                <span className="font-semibold text-gray-900">{funnel.checkouts_initiated_7d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Checkouts confirmed</span>
                <span className="font-semibold text-gray-900">{funnel.checkouts_confirmed_7d}</span>
              </div>
              <div className="mt-1 rounded-xl bg-main/5 p-4 text-center">
                <p className="text-2xl font-semibold text-main">{conversion === null ? "—" : `${conversion}%`}</p>
                <p className="text-xs text-gray-500">checkout conversion</p>
              </div>
            </div>
          </Panel>

          <Panel title="Follow-ups">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-lg font-semibold text-gray-900">{tasks.pending_count}</p>
                <p className="text-[11px] text-gray-400">Open</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-lg font-semibold text-gray-900">{tasks.due_today_count}</p>
                <p className="text-[11px] text-gray-400">Today</p>
              </div>
              <div className={`rounded-xl p-3 ${tasks.overdue_count > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <p className={`text-lg font-semibold ${tasks.overdue_count > 0 ? "text-red-600" : "text-gray-900"}`}>
                  {tasks.overdue_count}
                </p>
                <p className="text-[11px] text-gray-400">Overdue</p>
              </div>
            </div>
          </Panel>

          <Panel title="Referral Partners" action={{ label: "Lead magnets", href: "/marketer/crm/lead-magnets" }}>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-lg font-semibold text-gray-900">{ref.active_referral_partners}</p>
                <p className="text-[11px] text-gray-400">Active partners</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-lg font-semibold text-gray-900">{ref.total_lead_magnet_downloads}</p>
                <p className="text-[11px] text-gray-400">Magnet downloads</p>
              </div>
            </div>
            {ref.top_referral_partners.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No partner activity yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {ref.top_referral_partners.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-900">{p.name}</span>
                    <span className="text-gray-500">{p.uses_count} uses</span>
                  </li>
                ))}
              </ul>
            )}
            {ref.top_lead_magnet && (
              <p className="mt-4 text-xs text-gray-400">
                Top magnet: <span className="text-gray-700">{ref.top_lead_magnet.title}</span> ·{" "}
                {ref.top_lead_magnet.downloads} downloads
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
