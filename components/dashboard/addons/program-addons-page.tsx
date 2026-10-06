"use client";

import { useState } from "react";
import Link from "next/link";
import { useProgram } from "@/hooks/queries/programs";
import { useProgramAddons } from "@/hooks/queries/addons";
import { ProgramAddonDrawer } from "@/components/dashboard/addons/program-addon-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ADDON_KIND_OPTIONS, type ProgramAddon } from "@/types/addon";

const COLUMNS = ["Name", "Kind", "Description", "Base price", "Selection group", "Status", "Sort", "Price source"];

function kindLabel(kind: string) {
  return ADDON_KIND_OPTIONS.find((o) => o.value === kind)?.label ?? kind;
}

export function ProgramAddonsPage({ programSlug }: { programSlug: string }) {
  const { data: program } = useProgram(programSlug);
  const { data: addons, isLoading } = useProgramAddons(programSlug);
  const [drawer, setDrawer] = useState<{ addon?: ProgramAddon } | null>(null);

  const list = addons ?? [];
  const activeCount = list.filter((a) => a.is_active).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/admin/programs/${programSlug}/edit`} className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to program
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{program?.title ?? "Program"} · Add-ons</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>
                {list.length} add-on{list.length === 1 ? "" : "s"}
              </span>
              <span>·</span>
              <span>{activeCount} active</span>
              <span>·</span>
              <StatusBadge label={program?.is_active ? "Program active" : "Program inactive"} tone={program?.is_active ? "green" : "gray"} />
            </div>
          </div>
          <Button type="button" onClick={() => setDrawer({})} className="w-auto px-5">
            Create add-on
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
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
            {!isLoading && list.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-gray-400">
                  No add-ons yet. Create one to sell coaching, exam fees or a question bank with this program.
                </td>
              </tr>
            )}
            {list.map((a) => (
              <tr
                key={a.id}
                onClick={() => setDrawer({ addon: a })}
                className="cursor-pointer border-b border-gray-50 transition last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-4 font-medium text-gray-900">{a.name}</td>
                <td className="px-5 py-4 text-gray-600">{kindLabel(a.kind)}</td>
                <td className="max-w-xs px-5 py-4 text-gray-500">
                  <p className="line-clamp-1">{a.description || "—"}</p>
                </td>
                <td className="px-5 py-4 text-gray-900">
                  <p>${a.price_usd}</p>
                  {a.pricing_mode !== "usd_only" && <p className="text-xs text-gray-400">₦{a.price_ngn}</p>}
                </td>
                <td className="px-5 py-4 text-gray-600">{a.selection_group || "—"}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={a.is_active ? "Active" : "Inactive"} tone={a.is_active ? "green" : "gray"} />
                </td>
                <td className="px-5 py-4 text-gray-600">{a.sort_order}</td>
                <td className="px-5 py-4">
                  {a.is_program_price_effective === false ? (
                    <StatusBadge label="Cohort override" tone="yellow" />
                  ) : (
                    <StatusBadge label="Program price" tone="gray" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProgramAddonDrawer
        programSlug={programSlug}
        addon={drawer?.addon}
        open={!!drawer}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}
