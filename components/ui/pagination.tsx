"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// Server-driven pager — `page`/`totalPages` should come straight from a PaginatedResponse
// (count/total_pages), and onPageChange should trigger a new fetch for that page, not a
// client-side slice of an already-fetched array (that only ever covers whichever single page the
// backend happened to return).
export function Pagination({ page, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPageChange(i + 1)}
          aria-current={page === i + 1 ? "page" : undefined}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
            page === i + 1
              ? "bg-main text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
