"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminComments } from "@/hooks/queries/blog";
import { useApproveComment, useDeleteComment } from "@/hooks/mutations/blog";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { formatOrdinalDateTime } from "@/lib/format";
import type { BlogAdminComment } from "@/types/blog";

const COLUMNS = ["Comment", "Post", "Author", "Status", "Posted", "Action"];

function CommentRow({ comment }: { comment: BlogAdminComment }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const approve = useApproveComment();
  const deleteComment = useDeleteComment();

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="max-w-sm px-5 py-4 text-gray-700">
        <span className="line-clamp-2">{comment.body}</span>
      </td>
      <td className="px-5 py-4 text-gray-600">
        <span className="line-clamp-1">{comment.post_title}</span>
      </td>
      <td className="px-5 py-4 text-gray-600">
        {comment.author_name}
        {comment.is_guest && <span className="ml-1.5 text-xs text-gray-400">(Guest)</span>}
        {comment.author_email && <p className="text-xs text-gray-400">{comment.author_email}</p>}
      </td>
      <td className="px-5 py-4">
        <StatusBadge label={comment.is_approved ? "Approved" : "Pending"} tone={comment.is_approved ? "green" : "yellow"} />
      </td>
      <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(comment.created_at)}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {!comment.is_approved && (
            <button
              type="button"
              disabled={approve.isPending}
              onClick={() =>
                approve.mutate(comment.id, {
                  onSuccess: () => toast.success("Comment approved."),
                  onError: (err) => toast.error(err.message),
                })
              }
              className="text-xs font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approve.isPending ? "Approving…" : "Approve"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
        <ConfirmDeleteModal
          open={confirmDelete}
          title="Delete this comment?"
          description="This can't be undone."
          loading={deleteComment.isPending}
          onConfirm={() =>
            deleteComment.mutate(comment.id, {
              onSuccess: () => {
                toast.success("Comment deleted.");
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
      </td>
    </tr>
  );
}

export function BlogCommentsPage() {
  const [approvedFilter, setApprovedFilter] = useState<"" | "pending" | "approved">("pending");
  const { data: comments, isLoading } = useAdminComments({
    approved: approvedFilter === "" ? undefined : approvedFilter === "approved",
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Comment Moderation</h1>
      <p className="mt-1 text-sm text-gray-500">Approve comments before they show on a published article.</p>

      <div className="mt-6 flex gap-2">
        {(["pending", "approved", ""] as const).map((f) => (
          <button
            key={f || "all"}
            type="button"
            onClick={() => setApprovedFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              approvedFilter === f ? "bg-main text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "" ? "All" : f === "pending" ? "Pending" : "Approved"}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : !comments || comments.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No comments here." />
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
              {comments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
