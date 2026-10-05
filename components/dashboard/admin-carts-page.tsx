"use client";

import { useState } from "react";
import { useAdminCarts } from "@/hooks/queries/admin-carts";
import { AdminCartModal } from "@/components/dashboard/admin-cart-modal";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { formatOrdinalDateTime } from "@/lib/format";
import type { AdminCartSummary } from "@/types/admin-cart";

const COLUMNS = ["Learner", "Items", "Cohorts", "Last Updated", "Action"];

export function AdminCartsPage() {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AdminCartSummary | null>(null);
  const { data, isLoading, isFetching } = useAdminCarts(page);
  const carts = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Carts</h1>
      <p className="mt-1 text-sm text-gray-500">Every learner&apos;s current cart across the platform.</p>

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
            {!isLoading && carts.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No carts yet.
                </td>
              </tr>
            )}
            {carts.map((cart) => (
              <tr key={cart.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{cart.user.full_name || cart.user.email}</p>
                  <p className="text-xs text-gray-400">{cart.user.email}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{cart.item_count}</td>
                <td className="px-5 py-4 text-gray-600">{cart.cohorts.length}</td>
                <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(cart.updated_at)}</td>
                <td className="px-5 py-4">
                  <ActionsMenu items={[{ label: "View cart", onClick: () => setViewing(cart) }]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <AdminCartModal
        userId={viewing?.user.id ?? null}
        learnerName={viewing?.user.full_name || viewing?.user.email}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
