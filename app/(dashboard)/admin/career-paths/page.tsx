"use client";

import Link from "next/link";
import { useCareerPaths, useCareerPathPrograms } from "@/hooks/queries/career-paths";
import { StatusBadge } from "@/components/ui/status-badge";
import { PencilIcon } from "@/components/ui/pencil-icon";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { formatOrdinalDateTime, displayTitle } from "@/lib/format";
import type { CareerPath } from "@/types/career-paths";

const COLUMNS = ["Career Path", "Programs", "Level", "Certification", "Status", "Update", "Action"];

function accreditorLabel(certifications: string[]) {
  const joined = certifications.join(" ").toUpperCase();
  if (joined.includes("PMI")) return "PMI";
  if (joined.includes("PECB") || joined.includes("ISO")) return "PECB";
  return "—";
}

function CareerPathRow({ pathway }: { pathway: CareerPath }) {
  const { data: linkedPrograms } = useCareerPathPrograms(pathway.slug);

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="px-5 py-4 text-gray-900">{displayTitle(pathway.title)}</td>
      <td className="px-5 py-4 text-gray-600">{linkedPrograms ? linkedPrograms.length : "…"}</td>
      <td className="px-5 py-4 text-gray-600">{pathway.levels.length}</td>
      <td className="px-5 py-4 text-gray-600">{accreditorLabel(pathway.certifications)}</td>
      <td className="px-5 py-4">
        {pathway.is_active ? (
          <StatusBadge label="Published" tone="green" />
        ) : (
          <StatusBadge label="Draft" tone="yellow" />
        )}
      </td>
      <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(pathway.updated_at)}</td>
      <td className="px-5 py-4">
        <Link
          href={`/admin/career-paths/${pathway.slug}/edit`}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Edit career path"
        >
          <PencilIcon />
        </Link>
      </td>
    </tr>
  );
}

const AdminCareerPathsPage = () => {
  const { data: pathways, isLoading } = useCareerPaths();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Career Path</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit and publish Career Path.</p>
        </div>
        <Link
          href="/admin/career-paths/create"
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Add Career Path
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
            {isLoading && <TableSkeletonRows columns={COLUMNS.length} />}
            {!isLoading && pathways?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No career paths yet.
                </td>
              </tr>
            )}
            {pathways?.map((pathway) => (
              <CareerPathRow key={pathway.id} pathway={pathway} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCareerPathsPage;
