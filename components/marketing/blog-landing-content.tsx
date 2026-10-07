"use client";

import { useState } from "react";
import Link from "next/link";
import { useBlogLanding, useBlogPosts } from "@/hooks/queries/blog";
import { BlogPostCard } from "@/components/marketing/blog-post-card";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Reveal, RevealGroup, RevealItem, staggerDelay } from "@/components/motion/reveal";
import { ActiveLeadMagnetBanner } from "@/components/marketing/active-lead-magnet-banner";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 15l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BlogLandingContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const filtersActive = !!search.trim() || !!category;
  const { data: landing, isLoading: landingLoading } = useBlogLanding();
  const { data: filteredPosts, isLoading: filteredLoading } = useBlogPosts(
    filtersActive ? { search: search.trim() || undefined, category: category || undefined, page } : undefined,
  );

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  return (
    <div>
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-glass">CareerCentra Blog</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Insights for your career journey</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Practical guidance on certifications, project management, and building a career that
            keeps up with the industry.
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search articles…"
              className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
            />
          </div>

          {/* <div className="mt-6 max-w-sm mx-auto rounded-2xl bg-white/10 p-5 text-left">
            <p className="text-sm font-semibold">Get new articles in your inbox</p>
            <NewsletterForm theme="dark" className="mt-4" />
          </div> */}

          <ActiveLeadMagnetBanner className="mx-auto mt-8 max-w-xl text-left" />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {!landingLoading && landing && landing.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                !category ? "bg-main text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {landing.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory((c) => (c === cat.slug ? "" : cat.slug));
                  setPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  category === cat.slug ? "bg-main text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name} ({cat.public_post_count})
              </button>
            ))}
          </div>
        )}

        {filtersActive ? (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {filteredPosts ? `${filteredPosts.count} article${filteredPosts.count === 1 ? "" : "s"}` : "Searching…"}
              </p>
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-secondary hover:underline">
                Clear filters
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLoading && <CardGridSkeleton count={6} />}
              {!filteredLoading && filteredPosts?.results.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-gray-400">
                  No articles match your search.
                </p>
              )}
              {filteredPosts?.results.map((post, i) => (
                <Reveal key={post.id} delay={staggerDelay(i)} className="[&>*]:h-full">
                  <BlogPostCard post={post} className="h-full" />
                </Reveal>
              ))}
            </div>
            {filteredPosts && filteredPosts.total_pages > 1 && (
              <div className="mt-8 flex justify-end">
                <Pagination page={page} totalPages={filteredPosts.total_pages} onPageChange={setPage} />
              </div>
            )}
          </div>
        ) : (
          <>
            {landingLoading && (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <CardGridSkeleton count={6} />
              </div>
            )}

            {!landingLoading && landing && landing.featured_posts.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900">Featured</h2>
                <RevealGroup className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {landing.featured_posts.map((post) => (
                    <RevealItem key={post.id} className="[&>*]:h-full">
                      <BlogPostCard post={post} className="h-full" />
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            )}

            {!landingLoading && landing && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900">Latest Articles</h2>
                {landing.latest_posts.length === 0 ? (
                  <p className="mt-6 text-sm text-gray-400">No articles published yet — check back soon.</p>
                ) : (
                  <RevealGroup className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {landing.latest_posts.map((post) => (
                      <RevealItem key={post.id} className="[&>*]:h-full">
                        <BlogPostCard post={post} className="h-full" />
                      </RevealItem>
                    ))}
                  </RevealGroup>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16 text-center">
        <p className="text-sm text-gray-400">
          Looking for a specific topic? Browse by category above, or{" "}
          <Link href="/contact" className="font-medium text-secondary hover:underline">
            get in touch
          </Link>{" "}
          if you&apos;d like us to write about something.
        </p>
      </section>
    </div>
  );
}
