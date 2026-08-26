export function StatCard({
  label,
  value,
  loading,
  note,
}: {
  label: string;
  value?: number | string;
  loading?: boolean;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">
        {loading ? "…" : (value ?? "—")}
      </p>
      {note && <p className="mt-2 text-xs text-gray-400">{note}</p>}
    </div>
  );
}
