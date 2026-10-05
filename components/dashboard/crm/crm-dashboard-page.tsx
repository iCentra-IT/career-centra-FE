"use client";

import { useCrmDashboard } from "@/hooks/queries/crm";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyTableState } from "@/components/ui/empty-table";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { formatOrdinalDateTime, formatShortDate } from "@/lib/format";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function campaignTone(status: string): "green" | "yellow" | "red" | "gray" {
  const s = status.toLowerCase();
  if (s === "sent" || s === "completed") return "green";
  if (s === "queued" || s === "sending") return "yellow";
  if (s === "failed") return "red";
  return "gray";
}

export function CrmDashboardPage() {
  const { data, isLoading } = useCrmDashboard();

  if (isLoading) return <ListRowSkeleton rows={6} />;
  if (!data) return <p className="text-sm text-gray-400">Couldn&apos;t load the dashboard.</p>;

  const { leads, follow_up_tasks, campaigns_and_newsletter: camp, referral_partners_and_lead_magnets: ref, enrollment_funnel: funnel, cart_activity: carts } = data;
  const statusEntries = Object.entries(leads.by_status);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">CRM Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Pipeline, outreach and sales activity at a glance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Leads" value={leads.total_leads} note={`${leads.new_leads_7d} new in 7 days`} />
        <StatCard label="Pending Tasks" value={follow_up_tasks.pending_count} note={`${follow_up_tasks.due_today_count} due today`} />
        <StatCard label="Overdue Tasks" value={follow_up_tasks.overdue_count} />
        <StatCard label="Active Subscribers" value={camp.active_subscribers} note={`${camp.new_subscribers_7d} new in 7 days`} />
        <StatCard label="Campaigns (30d)" value={camp.campaigns_sent_last_30_days} />
        <StatCard label="Lead Magnet Downloads" value={ref.total_lead_magnet_downloads} note={`${ref.lead_magnet_downloads_7d} in 7 days`} />
        <StatCard label="Confirmed Enrolments" value={funnel.confirmed_enrollments_total} note={`${funnel.new_enrollments_7d} in 7 days`} />
        <StatCard label="Carts with Items" value={carts.overview.carts_with_items} note={`${carts.overview.abandoned_carts} abandoned`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Leads by Status">
          {statusEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No leads yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {statusEntries.map(([status, count]) => (
                <MiniStat key={status} label={status} value={count} />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Enrolment Funnel (7 days)">
          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="Checkouts started" value={funnel.checkouts_initiated_7d} />
            <MiniStat label="Checkouts confirmed" value={funnel.checkouts_confirmed_7d} />
          </div>
        </Panel>

        <Panel title="Recent Campaigns">
          {camp.recent_campaigns.length === 0 ? (
            <EmptyTableState columns={["Subject", "Status", "Sent", "Recipients"]} message="No campaigns sent yet." />
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

        <Panel title="Referral Partners & Lead Magnets">
          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="Active partners" value={ref.active_referral_partners} />
            <MiniStat label="Top magnet downloads" value={ref.top_lead_magnet?.downloads ?? 0} />
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wide text-gray-400">Top partners</p>
            {ref.top_referral_partners.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">No partner activity yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {ref.top_referral_partners.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-900">{p.name}</span>
                    <span className="text-gray-500">{p.uses_count} uses</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {ref.top_lead_magnet && (
            <p className="mt-4 text-xs text-gray-400">
              Top magnet: <span className="text-gray-700">{ref.top_lead_magnet.title}</span>
            </p>
          )}
        </Panel>

        <Panel title="Cart Activity">
          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="Total carts" value={carts.overview.total_carts} />
            <MiniStat label="New (7d)" value={carts.overview.new_carts_last_7_days} />
            <MiniStat label="Items in carts" value={carts.overview.total_items_in_carts} />
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wide text-gray-400">Most-carted cohorts</p>
            {carts.top_cohorts.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">Nothing in carts right now.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {carts.top_cohorts.map((row) => (
                  <li key={row.cohort.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-900">
                      Cohort #{row.cohort.id} · starts {formatShortDate(row.cohort.starts_on)}
                    </span>
                    <span className="text-gray-500">{row.in_cart_count} in carts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wide text-gray-400">Recent cart activity</p>
            {carts.recent_activity.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">No recent activity.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {carts.recent_activity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="min-w-0 truncate text-gray-900">{a.user.full_name || a.user.email}</span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {a.item_count} item{a.item_count === 1 ? "" : "s"} · {formatOrdinalDateTime(a.updated_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <Panel title="Follow-ups & Carts">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tasks due today</span>
              <span className="font-medium text-gray-900">{follow_up_tasks.due_today_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Empty carts</span>
              <span className="font-medium text-gray-900">{carts.overview.empty_carts}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
