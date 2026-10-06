"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCohortAddonOverrides } from "@/hooks/queries/addons";
import { useProgramAddons } from "@/hooks/queries/addons";
import {
  useCreateCohortAddonOverride,
  useDeleteCohortAddonOverride,
  usePatchCohortAddonOverride,
} from "@/hooks/mutations/addons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { Card, EmptyState } from "@/components/dashboard/dashboard-kit";

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

// Per-cohort exceptions to a program add-on's price or availability. Anything not listed here
// sells at the program's own price, so only exceptions need a row.
export function CohortAddonOverrides({ cohortId, programSlug }: { cohortId: number; programSlug: string }) {
  const { data: overrides, isLoading } = useCohortAddonOverrides(cohortId);
  const { data: addons = [] } = useProgramAddons(programSlug);
  const create = useCreateCohortAddonOverride(cohortId);
  const patch = usePatchCohortAddonOverride(cohortId);
  const remove = useDeleteCohortAddonOverride(cohortId);

  const [addonId, setAddonId] = useState("");
  const [available, setAvailable] = useState(true);
  const [priceUsd, setPriceUsd] = useState("");
  const [priceNgn, setPriceNgn] = useState("");

  const addonName = (id: number) => addons.find((a) => a.id === id)?.name ?? `Add-on #${id}`;
  const overridden = new Set((overrides ?? []).map((o) => o.addon));
  const choices = addons.filter((a) => !overridden.has(a.id));

  const onCreate = () => {
    if (!addonId) return;
    create.mutate(
      {
        addon: Number(addonId),
        is_available: available,
        price_override_usd: priceUsd ? Number(priceUsd).toFixed(2) : null,
        price_override_ngn: priceNgn ? Number(priceNgn).toFixed(2) : null,
      },
      {
        onSuccess: () => {
          toast.success("Override saved.");
          setAddonId("");
          setAvailable(true);
          setPriceUsd("");
          setPriceNgn("");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Card title="Add-on overrides for this cohort">
      <p className="-mt-2 mb-4 text-xs text-gray-400">
        Sold out or cheaper just for this run? Override an add-on here. Everything else keeps the program price.
      </p>

      {isLoading ? (
        <ListRowSkeleton rows={2} />
      ) : !overrides?.length ? (
        <EmptyState>No overrides — every add-on sells at its program price.</EmptyState>
      ) : (
        <ul className="divide-y divide-gray-100">
          {overrides.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{addonName(o.addon)}</p>
                <p className="text-xs text-gray-500">
                  {o.price_override_usd ? `USD ${o.price_override_usd}` : "USD at program price"}
                  {" · "}
                  {o.price_override_ngn ? `NGN ${o.price_override_ngn}` : "NGN at program price"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={o.is_available ? "Available" : "Unavailable"} tone={o.is_available ? "green" : "red"} />
                <button
                  type="button"
                  disabled={patch.isPending}
                  onClick={() =>
                    patch.mutate(
                      { id: o.id, payload: { is_available: !o.is_available } },
                      { onError: (err) => toast.error(err.message) },
                    )
                  }
                  className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  {o.is_available ? "Mark unavailable" : "Mark available"}
                </button>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(o.id, { onError: (err) => toast.error(err.message) })}
                  className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {choices.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm text-gray-900">Add-on</label>
            <select value={addonId} onChange={(e) => setAddonId(e.target.value)} className={selectClass}>
              <option value="">Choose an add-on</option>
              {choices.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="USD price (optional)" type="number" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
          <Input label="NGN price (optional)" type="number" step="0.01" value={priceNgn} onChange={(e) => setPriceNgn(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-secondary" />
            Available for this cohort
          </label>
          <div className="flex justify-end md:col-span-2">
            <Button type="button" onClick={onCreate} disabled={!addonId} loading={create.isPending} className="w-auto px-5">
              Save override
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
