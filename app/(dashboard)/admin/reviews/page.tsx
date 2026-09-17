"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminProgramTestimonials } from "@/hooks/queries/testimonials";
import { usePatchAdminProgramTestimonial, useDeleteAdminProgramTestimonial } from "@/hooks/mutations/testimonials";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrashIcon } from "@/components/ui/trash-icon";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { TableSkeletonRows } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { formatOrdinalDateTime } from "@/lib/format";
import type { AdminProgramTestimonial } from "@/types/testimonial";

const COLUMNS = ["Program", "Reviewer", "Rating", "Comment", "Submitted", "Status", "Action"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i < rating ? "#f5a623" : "none"} aria-hidden="true">
          <path
            d="M7 1l1.8 3.7 4 .6-3 2.9.7 4-3.5-1.9-3.5 1.9.7-4-3-2.9 4-.6L7 1z"
            stroke="#f5a623"
            strokeWidth="0.8"
          />
        </svg>
      ))}
    </div>
  );
}

function ReviewRow({ review }: { review: AdminProgramTestimonial }) {
  const patchTestimonial = usePatchAdminProgramTestimonial(review.id);
  const deleteTestimonial = useDeleteAdminProgramTestimonial();
  const [deleting, setDeleting] = useState(false);

  const toggleApproval = () => {
    patchTestimonial.mutate(
      { is_approved: !review.is_approved },
      {
        onSuccess: () => toast.success(review.is_approved ? "Review unpublished." : "Review approved."),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      <tr className="border-b border-gray-50 last:border-0">
        <td className="px-5 py-4 text-gray-900">{review.program_title}</td>
        <td className="px-5 py-4 text-gray-600">
          <p className="font-medium text-gray-900">{review.reviewer_name}</p>
          {review.reviewer_role && <p className="text-xs text-gray-400">{review.reviewer_role}</p>}
        </td>
        <td className="px-5 py-4">
          <StarRating rating={review.rating} />
        </td>
        <td className="max-w-xs px-5 py-4 text-gray-600">
          <p className="line-clamp-2">{review.comment}</p>
        </td>
        <td className="px-5 py-4 text-gray-600">{formatOrdinalDateTime(review.created_at)}</td>
        <td className="px-5 py-4">
          {review.is_approved ? (
            <StatusBadge label="Approved" tone="green" />
          ) : (
            <StatusBadge label="Pending" tone="yellow" />
          )}
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleApproval}
              disabled={patchTestimonial.isPending}
              className="text-xs font-medium text-secondary hover:underline disabled:opacity-60"
            >
              {review.is_approved ? "Unpublish" : "Approve"}
            </button>
            <button
              type="button"
              onClick={() => setDeleting(true)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Delete review"
            >
              <TrashIcon />
            </button>
          </div>
        </td>
      </tr>

      <ConfirmDeleteModal
        open={deleting}
        title="Delete this review?"
        description={`Remove ${review.reviewer_name}'s review permanently. This can't be undone.`}
        loading={deleteTestimonial.isPending}
        onClose={() => setDeleting(false)}
        onConfirm={() =>
          deleteTestimonial.mutate(review.id, {
            onSuccess: () => {
              toast.success("Review deleted.");
              setDeleting(false);
            },
            onError: (err) => toast.error(err.message),
          })
        }
      />
    </>
  );
}

const AdminReviewsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminProgramTestimonials(page);
  const reviews = data?.results ?? [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900">Reviews</h1>
      <p className="mt-1 text-sm text-gray-500">
        Moderate learner-submitted program reviews — approve them to show publicly, or remove them.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
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
            {isLoading && <TableSkeletonRows columns={COLUMNS.length} />}
            {!isLoading && reviews.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-6 text-center text-gray-400">
                  No reviews submitted yet.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && (data?.total_pages ?? 1) > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination page={page} totalPages={data?.total_pages ?? 1} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
