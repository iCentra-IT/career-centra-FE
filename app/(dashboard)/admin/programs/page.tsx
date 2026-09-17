"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { usePrograms } from "@/hooks/queries/programs";
import { useDeleteProgram } from "@/hooks/mutations/programs";
import { programDisplayPrice } from "@/types/programs";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { EyeIcon } from "@/components/ui/eye-icon";
import { TrashIcon } from "@/components/ui/trash-icon";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { formatMoney, formatOrdinalDateTime } from "@/lib/format";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const COLUMNS = ["Program", "Track", "Level", "Accreditation", "Price", "Status", "Update", "Action"];

const AdminProgramsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePrograms({ page, search: search.trim() || undefined });
  const programs = data?.results ?? [];
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string; title: string } | null>(null);
  const deleteProgram = useDeleteProgram();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProgram.mutate(deleteTarget.slug, {
      onSuccess: () => {
        toast.success("Program deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Programs</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit and publish certification programs.</p>
        </div>
        <Link
          href="/admin/programs/create"
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Add Program
        </Link>
      </div>

      <div className="relative mt-6 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search programs..."
          className="w-full rounded-md border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
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
            {isLoading && <TableSkeletonRows columns={COLUMNS.length} />}
            {!isLoading && programs.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  {search ? "No programs match your search." : "No programs yet."}
                </td>
              </tr>
            )}
            {programs.map((program) => {
              const accreditation =
                [
                  program.has_pmi_badge && "PMI",
                  program.has_pecb_badge && "PECB",
                  program.has_icentra_badge && "iCentra",
                ]
                  .filter(Boolean)
                  .join(", ") || "—";
              const price = programDisplayPrice(program);

              return (
                <tr key={program.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900">{program.title}</td>
                  <td className="px-5 py-4 text-gray-600">{program.program_type}</td>
                  <td className="px-5 py-4 text-gray-600">{program.level_display}</td>
                  <td className="px-5 py-4 text-gray-600">{accreditation}</td>
                  <td className="px-5 py-4 text-gray-600">{formatMoney(price.amount, price.currency)}</td>
                  <td className="px-5 py-4">
                    {program.is_active ? (
                      <StatusBadge label="Published" tone="green" />
                    ) : (
                      <StatusBadge label="Draft" tone="yellow" />
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(program.updated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/programms/${program.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="View program"
                      >
                        <EyeIcon />
                      </Link>
                      <Link
                        href={`/admin/programs/${program.slug}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Edit program"
                      >
                        <PencilIcon />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ slug: program.slug, title: program.title })}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Delete program"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isLoading && (data?.total_pages ?? 1) > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination page={page} totalPages={data?.total_pages ?? 1} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete program"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This can't be undone.`}
        loading={deleteProgram.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminProgramsPage;
