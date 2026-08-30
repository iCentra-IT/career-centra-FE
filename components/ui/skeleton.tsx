export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

// Full self-contained table (thead + skeleton tbody) — for pages that swap the whole table area out.
export function TableSkeleton({ columns, rows = 5 }: { columns: string[]; rows?: number }) {
  return (
    <table className="w-full min-w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
          {columns.map((col) => (
            <th key={col} className="px-5 py-3 font-medium">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <TableSkeletonRows columns={columns.length} rows={rows} />
      </tbody>
    </table>
  );
}

// Skeleton rows only — for tables that keep a static <thead> and swap just the <tbody> content.
export function TableSkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-50 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-5 py-4">
              <Skeleton className="h-4 w-full max-w-30" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-6 h-9 w-full rounded-full" />
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}

export function ListRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function RowCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-40">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-3 w-64 max-w-full" />
      <div className="mt-8 flex flex-col gap-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div>
      <div className="bg-gray-100 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-4 w-40 bg-gray-200/70" />
          <Skeleton className="mt-4 h-10 w-2/3 bg-gray-200/70" />
          <Skeleton className="mt-3 h-4 w-1/2 bg-gray-200/70" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
