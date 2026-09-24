"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePrograms } from "@/hooks/queries/programs";
import { useCohorts } from "@/hooks/queries/cohort";
import { nextOpenCohortForProgram } from "@/types/cohort";
import { ProgramCard } from "@/components/marketing/program-card";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Reveal, staggerDelay } from "@/components/motion/reveal";
import { PATHWAY_CATEGORIES } from "@/lib/pathways";

type SortOption = "relevance" | "price_asc" | "price_desc" | "newest";

// Confirmed full enum from GET /api/programs/'s level filter parameter docs — filtering by the raw
// value server-side, so this can't be derived from whatever level_display strings happen to be in
// the currently-loaded page.
const LEVEL_FILTER_OPTIONS = [
  { value: "foundation", label: "Foundation" },
  { value: "professional", label: "Professional" },
  { value: "advanced", label: "Advanced" },
  { value: "specialized", label: "Specialized" },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        disabled={disabled}
        title={disabled ? "Not available yet" : undefined}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProgramsPageContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(searchParams.get("track") ?? "");
  const [level, setLevel] = useState("");
  const [certBody, setCertBody] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [page, setPage] = useState(1);

  // Filtering (search/category/level/certification body/price range) and pagination are both
  // confirmed server-side via GET /api/programs/'s query params (a real capture showed count 26 /
  // total_pages 2 at a 20-per-page size) — only sorting stays client-side since the backend
  // doesn't document a sort param, so it's applied to whichever page is currently loaded.
  const { data: programs, isLoading } = usePrograms({
    search: search.trim() || undefined,
    program_type: category || undefined,
    level: level || undefined,
    certification_body: certBody || undefined,
    price_min: minPrice || undefined,
    price_max: maxPrice || undefined,
    page,
  });
  const { data: cohortsData } = useCohorts();

  const pageItems = useMemo(() => {
    const list = [...(programs?.results ?? [])];

    // "Relevance" is whatever order the backend itself returns — it already accounts for cohorts,
    // so no client-side re-sorting on top of that.
    if (sort === "price_asc") list.sort((a, b) => parseFloat(a.base_price_usd) - parseFloat(b.base_price_usd));
    if (sort === "price_desc") list.sort((a, b) => parseFloat(b.base_price_usd) - parseFloat(a.base_price_usd));
    if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [programs, sort]);

  const totalCount = programs?.count ?? pageItems.length;
  const totalPages = programs?.total_pages ?? 1;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setCertBody("");
    setMinPrice("");
    setMaxPrice("");
    setSort("relevance");
    setPage(1);
  };

  return (
    <div>
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <Reveal className="mx-auto max-w-6xl">
          <p className="text-sm text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            › Programs
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Programs &amp; Courses</h1>
          <p className="mt-3 max-w-xl text-white/70">
            Browse all certification programs and enrol in your next course.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="relative flex-1">
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

        <div className="mt-4 flex flex-wrap gap-2 hidden md:block">
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              category === "" ? "bg-main text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Programs
          </button>
          {PATHWAY_CATEGORIES.map((cat) => (
            <button
              key={cat.programType}
              type="button"
              onClick={() => {
                setCategory(cat.programType);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                category === cat.programType
                  ? "bg-main text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-auto sm:min-w-40 hidden md:block">
            <Select
              label="Certification Level"
              value={level}
              onChange={(v) => {
                setLevel(v);
                setPage(1);
              }}
              options={[{ label: "All Levels", value: "" }, ...LEVEL_FILTER_OPTIONS]}
            />
          </div>

          <div className="w-full sm:w-auto sm:min-w-40">
            <Select
              label="Certification Body"
              value={certBody}
              onChange={(v) => {
                setCertBody(v);
                setPage(1);
              }}
              options={[
                { label: "All Bodies", value: "" },
                { label: "iCentra", value: "icentra" },
                { label: "PMI", value: "pmi" },
                { label: "PECB", value: "pecb" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto hidden md:block">
            <label className="text-xs font-medium text-gray-500">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary sm:w-24"
              />
              <span className="text-gray-300">–</span>
              <input
                type="number"
                placeholder="$5,000"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary sm:w-24"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto sm:min-w-45 hidden md:block">
            <label className="text-xs font-medium text-gray-500">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="mt-1.5 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Sort: Price (low to high)</option>
              <option value="price_desc">Sort: Price (high to low)</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-secondary hidden md:block hover:underline sm:mb-2.5"
          >
            Clear all filters
          </button>
        </div>

        {!isLoading && (
          <p className="mt-4 text-sm text-gray-400">
            {totalCount} program{totalCount === 1 ? "" : "s"} found
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && <CardGridSkeleton count={8} />}
          {!isLoading && pageItems.length === 0 && (
            <p className="text-sm text-gray-400">No programs match these filters.</p>
          )}
          {pageItems.map((program, i) => (
            <Reveal key={program.id} delay={staggerDelay(i)} className="[&>*]:h-full">
              <ProgramCard
                program={program}
                buttonTone="blue"
                cohort={nextOpenCohortForProgram(cohortsData?.results ?? [], program.id)}
              />
            </Reveal>
          ))}
        </div>

        {!isLoading && totalCount > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              Showing {pageItems.length} of {totalCount} programs
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}

const ProgramsPage = () => (
  <Suspense fallback={null}>
    <ProgramsPageContent />
  </Suspense>
);

export default ProgramsPage;
