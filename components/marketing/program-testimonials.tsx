"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProgramTestimonials } from "@/hooks/queries/testimonials";
import { useCreateProgramTestimonial } from "@/hooks/mutations/testimonials";
import type { ProgramTestimonial } from "@/types/testimonial";
import { SectionEyebrow } from "./program-detail-content";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "#f5a623" : "none"} aria-hidden="true">
      <path
        d="M8 1.5l2 4.2 4.5.6-3.3 3.3.8 4.6L8 12l-4 2.2.8-4.6-3.3-3.3 4.5-.6L8 1.5z"
        stroke="#f5a623"
        strokeWidth="0.9"
      />
    </svg>
  );
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="cursor-pointer"
        >
          <StarIcon filled={n <= value} />
        </button>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function TestimonialCard({ testimonial }: { testimonial: ProgramTestimonial }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-left">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} filled={n <= testimonial.rating} />
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">&ldquo;{testimonial.comment}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        {testimonial.reviewer_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for
          <img
            src={testimonial.reviewer_image_url}
            alt={testimonial.reviewer_name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-semibold text-secondary">
            {initials(testimonial.reviewer_name) || "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{testimonial.reviewer_name}</p>
          {testimonial.reviewer_role && (
            <p className="truncate text-xs text-gray-400">{testimonial.reviewer_role}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const MAX_REVIEWER_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

function WriteReviewForm({ slug, onSubmitted }: { slug: string; onSubmitted: () => void }) {
  const createTestimonial = useCreateProgramTestimonial(slug);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewerImage, setReviewerImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file");
      return;
    }
    if (file.size > MAX_REVIEWER_IMAGE_BYTES) {
      setImageError("Image must be 2MB or smaller");
      return;
    }
    setImageError(undefined);
    setReviewerImage(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;

    createTestimonial.mutate(
      {
        reviewer_name: reviewerName.trim(),
        reviewer_role: reviewerRole.trim(),
        comment: comment.trim(),
        rating,
        reviewer_image: reviewerImage ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Thanks for your review! It'll show once it's been reviewed by our team.");
          setReviewerName("");
          setReviewerRole("");
          setComment("");
          setRating(5);
          setReviewerImage(null);
          onSubmitted();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Your rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Your name</label>
          <input
            required
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Your role (optional)</label>
          <input
            value={reviewerRole}
            onChange={(e) => setReviewerRole(e.target.value)}
            placeholder="Project Manager"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Your review</label>
        <textarea
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this program..."
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-secondary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
        />
        {reviewerImage && <p className="text-xs text-gray-500">{reviewerImage.name}</p>}
        {imageError && <p className="text-xs text-red-500">{imageError}</p>}
      </div>

      <button
        type="submit"
        disabled={createTestimonial.isPending}
        className="self-start rounded-full bg-main px-6 py-2.5 text-sm font-medium text-white hover:bg-deep-blue disabled:opacity-60"
      >
        {createTestimonial.isPending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

export function ProgramTestimonials({ slug }: { slug: string }) {
  const { data, isLoading } = useProgramTestimonials(slug);
  const testimonials = data?.results ?? [];
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="scroll-mt-32 border-gray-100 py-6">
        <SectionEyebrow>Reviews</SectionEyebrow>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="mt-1 text-2xl font-semibold text-gray-900">Learner Testimonials</h3>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="text-sm font-medium text-secondary hover:underline"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && <WriteReviewForm slug={slug} onSubmitted={() => setShowForm(false)} />}

      {isLoading && <p className="mt-4 text-sm text-gray-400">Loading testimonials…</p>}
      {!isLoading && testimonials.length === 0 && !showForm && (
        <p className="mt-4 text-sm text-gray-400">
          No testimonials yet. Be the first to share your experience.
        </p>
      )}
      {testimonials.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      )}
    </div>
  );
}
