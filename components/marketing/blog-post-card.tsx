import Link from "next/link";
import type { BlogPostSummary } from "@/types/blog";
import { formatShortDate } from "@/lib/format";

export function BlogPostCard({ post, className = "" }: { post: BlogPostSummary; className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-main/10 ${className}`}
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-linear-to-br from-main to-deep-blue">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for
          <img
            src={post.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-white/60">
            CareerCentra
          </div>
        )}
        {post.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-deep-blue">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
          <span>{post.category_name}</span>
          <span className="text-gray-300">·</span>
          <span className="font-normal normal-case text-gray-400">
            {post.reading_time_minutes} min read
          </span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-gray-900 group-hover:text-main">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-500">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>{post.author_name}</span>
          <span>{formatShortDate(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
