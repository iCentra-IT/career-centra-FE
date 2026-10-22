"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAdminLearners } from "@/hooks/queries/admin-learners";
import { useAllAdminCarts } from "@/hooks/queries/admin-carts";
import { exportAdminLearners } from "@/lib/api/admin-users";
import { AdminCartModal } from "@/components/dashboard/admin-cart-modal";
import { EmptyTableState } from "@/components/ui/empty-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/format";
import { LEARNER_EXPORT_COLUMNS, LearnerExportColumnKey } from "@/types/learner";

const COLUMNS = ["", "Name", "Email", "Location", "Enrolments", "Certificates", "Joined", "Status", "Cart", "Action"];

const ALL_COLUMN_KEYS = LEARNER_EXPORT_COLUMNS.map((c) => c.key);

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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewing, setViewing] = useState<{ id: number; name: string } | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [exportColumns, setExportColumns] = useState<Set<LearnerExportColumnKey>>(
    new Set(ALL_COLUMN_KEYS),
  );
  const [exporting, setExporting] = useState(false);
  const columnPickerRef = useRef<HTMLDivElement>(null);
  const { data: learners, isLoading: learnersLoading } = useAdminLearners();
  const { data: carts, isLoading: cartsLoading } = useAllAdminCarts();

  useEffect(() => {
    if (!columnPickerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!columnPickerRef.current?.contains(e.target as Node)) setColumnPickerOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [columnPickerOpen]);

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
    let list = learners ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) => l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    }
    if (dateFrom) {
      list = list.filter((l) => l.date_joined.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((l) => l.date_joined.slice(0, 10) <= dateTo);
    }
    return list;
  }, [learners, search, dateFrom, dateTo]);

  const isLoading = learnersLoading || cartsLoading;
  const allVisibleSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));

  const toggleAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) return new Set();
      const next = new Set(prev);
      filtered.forEach((l) => next.add(l.id));
      return next;
    });
  };

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleColumn = (key: LearnerExportColumnKey) => {
    setExportColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = async () => {
    if (exportColumns.size === 0) {
      toast.error("Pick at least one column to export.");
      return;
    }
    setExporting(true);
    try {
      const columns = ALL_COLUMN_KEYS.filter((k) => exportColumns.has(k));
      const blob = await exportAdminLearners(
        selected.size > 0
          ? { ids: Array.from(selected), columns }
          : {
              search: search.trim() || undefined,
              date_joined_after: dateFrom || undefined,
              date_joined_before: dateTo || undefined,
              columns,
            },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learners-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Learners</h1>
          <p className="mt-1 text-sm text-gray-500">Every registered learner, with what&apos;s sitting in their cart.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div ref={columnPickerRef} className="relative">
            <button
              type="button"
              onClick={() => setColumnPickerOpen((o) => !o)}
              className="whitespace-nowrap rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Columns ({exportColumns.size})
            </button>
            {columnPickerOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-100 bg-white p-2 shadow-lg">
                {LEARNER_EXPORT_COLUMNS.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={exportColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={handleExport}
            loading={exporting}
            className="w-auto whitespace-nowrap px-5"
          >
            {selected.size > 0 ? `Export CSV (${selected.size} selected)` : "Export CSV"}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="max-w-xs flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Joined</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || undefined}
            className="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
          <span>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            className="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
        {(search || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm font-medium text-secondary hover:underline"
          >
            Clear filters
          </button>
        )}
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
                {COLUMNS.map((col, i) =>
                  i === 0 ? (
                    <th key={col || "select"} className="px-5 py-3 font-medium">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        aria-label="Select all learners"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </th>
                  ) : (
                    <th key={col} className="px-5 py-3 font-medium">
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((learner) => {
                const cartItems = cartByUser.get(learner.id);
                return (
                  <tr key={learner.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(learner.id)}
                        onChange={() => toggleRow(learner.id)}
                        aria-label={`Select ${learner.full_name}`}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
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
