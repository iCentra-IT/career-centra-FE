"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useBlogCategoryPosts, useBlogCategories } from "@/hooks/queries/blog";
import { BlogPostCard } from "@/components/marketing/blog-post-card";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export default function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [page, setPage] = useState(1);

  const { data: categories } = useBlogCategories();
  const category = categories?.results.find((c) => c.slug === slug);
  const { data: posts, isLoading } = useBlogCategoryPosts(slug, page);

  return (
    <div>
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-glass">
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>{" "}
            / Category
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{category?.name ?? "Category"}</h1>
          {category?.description && (
            <p className="mx-auto mt-4 max-w-2xl text-white/70">{category.description}</p>
          )}
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardGridSkeleton count={6} />
          </div>
        )}
        {!isLoading && posts?.results.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No articles in this category yet.</p>
        )}
        {!isLoading && posts && posts.results.length > 0 && (
          <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.results.map((post) => (
              <RevealItem key={post.id} className="[&>*]:h-full">
                <BlogPostCard post={post} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {posts && posts.total_pages > 1 && (
          <div className="mt-8 flex justify-end">
            <Pagination page={page} totalPages={posts.total_pages} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}
