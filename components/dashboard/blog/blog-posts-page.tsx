"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminBlogPosts } from "@/hooks/queries/blog";
import {
  useDeleteBlogPost,
  useFeatureBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from "@/hooks/mutations/blog";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ActionsMenu, type ActionMenuItem } from "@/components/ui/actions-menu";
import { formatShortDate } from "@/lib/format";
import type { BlogPostAdmin, BlogPostStatus } from "@/types/blog";

const COLUMNS = ["Title", "Category", "Status", "Views", "Updated", "Action"];

const STATUS_OPTIONS: { value: BlogPostStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function statusTone(status: BlogPostStatus): "green" | "yellow" | "red" | "gray" {
  if (status === "published") return "green";
  if (status === "pending_review") return "yellow";
  if (status === "archived") return "red";
  return "gray";
}

function statusLabel(status: BlogPostStatus) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function PostActions({ post, basePath }: { post: BlogPostAdmin; basePath: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const publish = usePublishBlogPost();
  const unpublish = useUnpublishBlogPost();
  const feature = useFeatureBlogPost();
  const deletePost = useDeleteBlogPost();

  const items: ActionMenuItem[] = [
    { label: "Edit", onClick: () => (window.location.href = `${basePath}/${post.slug}/edit`) },
  ];

  if (post.status === "published") {
    items.push({
      label: unpublish.isPending ? "Unpublishing…" : "Unpublish",
      onClick: () =>
        unpublish.mutate(post.slug, {
          onSuccess: () => toast.success("Post unpublished."),
          onError: (err) => toast.error(err.message),
        }),
      disabled: unpublish.isPending,
    });
  } else {
    items.push({
      label: publish.isPending ? "Publishing…" : "Publish Now",
      onClick: () =>
        publish.mutate(post.slug, {
          onSuccess: () => toast.success("Post published."),
          onError: (err) => toast.error(err.message),
        }),
      disabled: publish.isPending,
      tone: "success",
    });
  }

  items.push({
    label: post.is_featured ? "Remove from Featured" : "Mark as Featured",
    onClick: () =>
      feature.mutate(
        { slug: post.slug, isFeatured: !post.is_featured },
        {
          onSuccess: () => toast.success(post.is_featured ? "Removed from featured." : "Marked as featured."),
          onError: (err) => toast.error(err.message),
        },
      ),
    disabled: feature.isPending,
  });

  items.push({ label: "Delete", onClick: () => setConfirmDelete(true), tone: "danger" });

  return (
    <>
      <ActionsMenu items={items} />
      <ConfirmDeleteModal
        open={confirmDelete}
        title="Delete this post?"
        description={`"${post.title}" will be permanently deleted. This can't be undone.`}
        loading={deletePost.isPending}
        onConfirm={() =>
          deletePost.mutate(post.slug, {
            onSuccess: () => {
              toast.success("Post deleted.");
              setConfirmDelete(false);
            },
            onError: (err) => {
              toast.error(err.message);
              setConfirmDelete(false);
            },
          })
        }
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}

// Shared between /admin/blog (staff-admin, full access) and /marketer (blog-only dashboard) —
// basePath controls where "Create"/"Edit" links point so both contexts stay within their own area.
export function BlogPostsPage({ basePath }: { basePath: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BlogPostStatus | "">("");
  const [mineOnly, setMineOnly] = useState(false);

  const { data: posts, isLoading } = useAdminBlogPosts({
    search: search.trim() || undefined,
    status: status || undefined,
    mine: mineOnly || undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-500">Write, review and publish articles.</p>
        </div>
        <Link
          href={`${basePath}/create`}
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          + New Post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="max-w-xs flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BlogPostStatus | "")}
          className="rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
          />
          My posts only
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : !posts || posts.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No posts match yet." />
        ) : (
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
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 last:border-0">
                  <td className="max-w-sm px-5 py-4">
                    <Link href={`${basePath}/${post.slug}/edit`} className="font-medium text-gray-900 hover:text-secondary">
                      <span className="line-clamp-1">{post.title}</span>
                    </Link>
                    {post.is_featured && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Featured
                      </span>
                    )}
                    {post.pending_comment_count > 0 && (
                      <p className="mt-0.5 text-xs text-secondary">
                        {post.pending_comment_count} comment{post.pending_comment_count === 1 ? "" : "s"} awaiting review
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{post.category_name}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={statusLabel(post.status)} tone={statusTone(post.status)} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{post.view_count}</td>
                  <td className="px-5 py-4 text-gray-600">{formatShortDate(post.updated_at)}</td>
                  <td className="px-5 py-4">
                    <PostActions post={post} basePath={basePath} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
