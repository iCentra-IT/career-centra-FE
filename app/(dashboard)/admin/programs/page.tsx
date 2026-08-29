"use client";

import Link from "next/link";
import { usePrograms } from "@/hooks/queries/programs";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { formatOrdinalDateTime, formatUsd } from "@/lib/format";

const COLUMNS = ["Program", "Track", "Level", "Accreditation", "Price", "Status", "Update", "Action"];

const AdminProgramsPage = () => {
  const { data: programs, isLoading } = usePrograms();

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
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && programs?.results?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No programs yet.
                </td>
              </tr>
            )}
            {programs?.results?.map((program) => {
              const accreditation =
                [program.has_pmi_badge && "PMI", program.has_pecb_badge && "PECB"]
                  .filter(Boolean)
                  .join(", ") || "—";

              return (
                <tr key={program.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900">{program.title}</td>
                  <td className="px-5 py-4 text-gray-600">{program.program_type}</td>
                  <td className="px-5 py-4 text-gray-600">{program.level_display}</td>
                  <td className="px-5 py-4 text-gray-600">{accreditation}</td>
                  <td className="px-5 py-4 text-gray-600">{formatUsd(program.base_price_usd)}</td>
                  <td className="px-5 py-4">
                    {program.is_active ? (
                      <StatusBadge label="Published" tone="green" />
                    ) : (
                      <StatusBadge label="Draft" tone="yellow" />
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(program.updated_at)}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/programs/${program.slug}/edit`}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Edit program"
                    >
                      <PencilIcon />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProgramsPage;
