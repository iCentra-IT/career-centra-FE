"use client";

import { useMemo, useState } from "react";
import { useAdminLearners } from "@/hooks/queries/admin-learners";
import { useAllAdminCarts } from "@/hooks/queries/admin-carts";
import { AdminCartModal } from "@/components/dashboard/admin-cart-modal";
import { EmptyTableState } from "@/components/ui/empty-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { formatShortDate } from "@/lib/format";

const COLUMNS = ["Name", "Email", "Location", "Enrolments", "Certificates", "Joined", "Status", "Cart", "Action"];

function statusTone(status: string): "green" | "yellow" | "red" | "gray" {
  if (status === "active") return "green";
  if (status === "pending_verification") return "yellow";
  if (status === "suspended") return "red";
  return "gray";
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Read-only: marketers see every learner and whether they have items in their cart, but can't
// deactivate or delete accounts — those stay admin-only on the Users page.
export function MarketerLearnersPage() {
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<{ id: number; name: string } | null>(null);
  const { data: learners, isLoading: learnersLoading } = useAdminLearners();
  const { data: carts, isLoading: cartsLoading } = useAllAdminCarts();

  // Carts keyed by user id, only counting carts that actually hold something — an empty cart row
  // shouldn't make a learner look like they have pending purchases.
  const cartByUser = useMemo(() => {
    const map = new Map<number, number>();
    carts?.forEach((c) => {
      if (c.item_count > 0) map.set(c.user.id, c.item_count);
    });
    return map;
  }, [carts]);

  const filtered = useMemo(() => {
    const list = learners ?? [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((l) => l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
  }, [learners, search]);

  const isLoading = learnersLoading || cartsLoading;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Learners</h1>
      <p className="mt-1 text-sm text-gray-500">Every registered learner, with what&apos;s sitting in their cart.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="max-w-xs flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : filtered.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No learners match yet." />
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
              {filtered.map((learner) => {
                const cartItems = cartByUser.get(learner.id);
                return (
                  <tr key={learner.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-4 text-gray-900">{learner.full_name}</td>
                    <td className="px-5 py-4 text-gray-600">{learner.email}</td>
                    <td className="px-5 py-4 text-gray-600">{learner.location || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{learner.enrollment_count}</td>
                    <td className="px-5 py-4 text-gray-600">{learner.certificate_count}</td>
                    <td className="px-5 py-4 text-gray-600">{formatShortDate(learner.date_joined)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge label={statusLabel(learner.status)} tone={statusTone(learner.status)} />
                    </td>
                    <td className="px-5 py-4">
                      {cartItems ? (
                        <StatusBadge label={`${cartItems} item${cartItems === 1 ? "" : "s"}`} tone="yellow" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {cartItems ? (
                        <ActionsMenu
                          items={[
                            {
                              label: "View cart",
                              onClick: () => setViewing({ id: learner.id, name: learner.full_name }),
                            },
                          ]}
                        />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AdminCartModal
        userId={viewing?.id ?? null}
        learnerName={viewing?.name}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
