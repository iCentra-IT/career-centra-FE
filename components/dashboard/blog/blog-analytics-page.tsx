"use client";

import { useState } from "react";
import Link from "next/link";
import { useBlogAnalytics } from "@/hooks/queries/blog";
import { StatCard } from "@/components/ui/stat-card";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";

const RANGE_OPTIONS: { value: number | "all"; label: string }[] = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const COLUMNS = ["Post", "Period Views", "Total Views"];

export function BlogAnalyticsPage({ basePath }: { basePath: string }) {
  const [range, setRange] = useState<number | "all">(30);
  const { data: analytics, isLoading } = useBlogAnalytics(range);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Blog Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">Distinct readers, not raw page hits.</p>

      <div className="mt-6 flex gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => setRange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              range === opt.value ? "bg-main text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Posts" value={analytics?.total_posts} loading={isLoading} />
        <StatCard label="Total Views" value={analytics?.total_views} loading={isLoading} />
        <StatCard label="Unique Readers" value={analytics?.unique_readers} loading={isLoading} />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Top Posts</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : !analytics || analytics.top_posts.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No reads recorded yet for this range." />
        ) : (
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
              {analytics.top_posts.map((post) => (
                <tr key={post.post_id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    <Link href={`${basePath}/${post.slug}/edit`} className="hover:text-secondary">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{post.period_views}</td>
                  <td className="px-5 py-4 text-gray-600">{post.view_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
