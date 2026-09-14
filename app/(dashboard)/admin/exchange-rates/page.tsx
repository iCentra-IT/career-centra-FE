"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useExchangeRates } from "@/hooks/queries/exchange-rates";
import {
  useCreateExchangeRate,
  useDeleteExchangeRate,
  usePatchExchangeRate,
} from "@/hooks/mutations/exchange-rates";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { TrashIcon } from "@/components/ui/trash-icon";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";
import { Pagination } from "@/components/ui/pagination";
import { formatOrdinalDateTime } from "@/lib/format";
import type { ExchangeRate, ExchangeRateCurrency } from "@/types/exchange-rate";

const CURRENCIES: ExchangeRateCurrency[] = ["NGN", "USD", "EUR", "GBP", "GHS", "KES"];
const COLUMNS = ["Base", "Quote", "Rate", "Last Updated", "Actions"];

function ExchangeRateFormModal({
  editing,
  onClose,
}: {
  editing: ExchangeRate | null;
  onClose: () => void;
}) {
  const [baseCurrency, setBaseCurrency] = useState(editing?.base_currency ?? CURRENCIES[0]);
  const [quoteCurrency, setQuoteCurrency] = useState(editing?.quote_currency ?? CURRENCIES[1]);
  const [rate, setRate] = useState(editing?.rate ?? "");
  const [error, setError] = useState<string | null>(null);

  const createRate = useCreateExchangeRate();
  const patchRate = usePatchExchangeRate(editing?.id ?? 0);
  const isPending = createRate.isPending || patchRate.isPending;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rate.trim()) {
      setError("Rate is required");
      return;
    }
    setError(null);

    const payload = { base_currency: baseCurrency, quote_currency: quoteCurrency, rate: rate.trim() };
    const mutation = editing ? patchRate : createRate;

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(editing ? "Exchange rate updated." : "Exchange rate added.");
        onClose();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Modal open onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">
          {editing ? "Edit Exchange Rate" : "Add Exchange Rate"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Set how many units of the quote currency one unit of the base currency is worth.
        </p>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Base Currency</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">Quote Currency</label>
              <select
                value={quoteCurrency}
                onChange={(e) => setQuoteCurrency(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Rate <span className="text-secondary">*</span>
            </label>
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 1650.25"
              inputMode="decimal"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <p className="text-xs text-gray-400">
              1 {baseCurrency} = {rate || "…"} {quoteCurrency}
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="submit" loading={isPending} className="w-auto px-6">
              {editing ? "Save Changes" : "Add Rate"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

const ExchangeRatesPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExchangeRates(page);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ExchangeRate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExchangeRate | null>(null);
  const deleteRate = useDeleteExchangeRate();

  const rates = data?.results ?? [];

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (rate: ExchangeRate) => {
    setEditTarget(rate);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteRate.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Exchange rate deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Exchange Rates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set the currency conversion rates used across pricing and checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Add Exchange Rate
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
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
              <TableSkeletonRows columns={COLUMNS.length} />
            </tbody>
          </table>
        ) : rates.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No exchange rates set yet." />
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
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">{rate.base_currency}</td>
                  <td className="px-5 py-4 text-gray-600">{rate.quote_currency}</td>
                  <td className="px-5 py-4 text-gray-600">{rate.rate}</td>
                  <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(rate.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(rate)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Edit exchange rate"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(rate)}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Delete exchange rate"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && (data?.total_pages ?? 1) > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination page={page} totalPages={data?.total_pages ?? 1} onPageChange={setPage} />
        </div>
      )}

      {formOpen && <ExchangeRateFormModal editing={editTarget} onClose={closeForm} />}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete exchange rate"
        description={`Are you sure you want to delete the ${deleteTarget?.base_currency} → ${deleteTarget?.quote_currency} rate? This can't be undone.`}
        loading={deleteRate.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ExchangeRatesPage;
