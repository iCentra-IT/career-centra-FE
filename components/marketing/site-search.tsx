"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearch } from "@/hooks/queries/search";
import { usePrograms } from "@/hooks/queries/programs";
import { useCareerPaths } from "@/hooks/queries/career-paths";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SiteSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = useSearch(query);
  const { data: programs } = usePrograms();
  const { data: pathways } = useCareerPaths();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Search only returns titles, so cross-reference the already-loaded lists to get real links.
  const matchedPrograms = (results?.programs ?? [])
    .map((title) => programs?.find((p) => p.program.title === title))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const matchedPathways = (results?.career_paths ?? [])
    .map((title) => pathways?.find((p) => p.title === title))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const hasQuery = query.trim().length > 1;
  const hasResults = matchedPrograms.length > 0 || matchedPathways.length > 0;

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <SearchIcon />
      </span>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search programs..."
        className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
      />
      {open && hasQuery && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
          {isFetching && <p className="px-4 py-3 text-sm text-gray-400">Searching…</p>}
          {!isFetching && !hasResults && (
            <p className="px-4 py-3 text-sm text-gray-400">No matches for &quot;{query}&quot;.</p>
          )}
          {matchedPrograms.length > 0 && (
            <div className="border-b border-gray-50 py-2">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Programs
              </p>
              {matchedPrograms.map((p) => (
                <Link
                  key={p.program.id}
                  href={`/programms/${p.program.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {p.program.title}
                </Link>
              ))}
            </div>
          )}
          {matchedPathways.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Career Paths
              </p>
              {matchedPathways.map((p) => (
                <Link
                  key={p.id}
                  href={`/career-paths/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
