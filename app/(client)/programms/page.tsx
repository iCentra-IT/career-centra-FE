"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePrograms } from "@/hooks/queries/programs";
import { useCohorts } from "@/hooks/queries/cohort";
import { nextOpenCohortForProgram } from "@/types/cohort";
import { ProgramCard } from "@/components/marketing/program-card";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { PATHWAY_CATEGORIES } from "@/lib/pathways";

const PAGE_SIZE = 9;

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

  // Filtering (search/category/level/certification body/price range) is confirmed server-side via
  // GET /api/programs/'s query params — only sorting and display pagination stay client-side since
  // the backend doesn't document a sort or page param.
  const { data: programs, isLoading } = usePrograms({
    search: search.trim() || undefined,
    program_type: category || undefined,
    level: level || undefined,
    certification_body: certBody || undefined,
    price_min: minPrice || undefined,
    price_max: maxPrice || undefined,
  });
  const { data: cohortsData } = useCohorts();

  const filtered = useMemo(() => {
    const list = [...(programs?.results ?? [])];

    if (sort === "price_asc") list.sort((a, b) => parseFloat(a.base_price_usd) - parseFloat(b.base_price_usd));
    if (sort === "price_desc") list.sort((a, b) => parseFloat(b.base_price_usd) - parseFloat(a.base_price_usd));
    if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [programs, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        <div className="mx-auto max-w-6xl">
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-gray-900">Filter Programs</h2>

            <Select
              label="Certification Level"
              value={level}
              onChange={(v) => {
                setLevel(v);
                setPage(1);
              }}
              options={[{ label: "All Levels", value: "" }, ...LEVEL_FILTER_OPTIONS]}
            />
            <Select label="Delivery Format" value="" options={[{ label: "All Formats", value: "" }]} disabled />
            <Select label="Duration" value="" options={[{ label: "Any Duration", value: "" }]} disabled />
            <Select label="Upcoming Cohort" value="" options={[{ label: "Any Date", value: "" }]} disabled />
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

            <div className="flex flex-col gap-1.5">
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
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
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
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-medium text-secondary hover:underline"
            >
              Clear all filters
            </button>
          </aside>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
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
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price_asc">Sort: Price (low to high)</option>
                <option value="price_desc">Sort: Price (high to low)</option>
                <option value="newest">Sort: Newest</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
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

            {!isLoading && (
              <p className="mt-4 text-sm text-gray-400">
                {filtered.length} program{filtered.length === 1 ? "" : "s"} found
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading && <CardGridSkeleton count={9} />}
              {!isLoading && pageItems.length === 0 && (
                <p className="text-sm text-gray-400">No programs match these filters.</p>
              )}
              {pageItems.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  buttonTone="blue"
                  cohort={nextOpenCohortForProgram(cohortsData?.results ?? [], program.id)}
                />
              ))}
            </div>

            {filtered.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-400">
                  Showing {pageItems.length} of {filtered.length} programs
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ‹
                  </button>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
                        currentPage === i + 1
                          ? "bg-main text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
