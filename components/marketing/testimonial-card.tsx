export function StarIcon({ filled }: { filled: boolean }) {
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

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export interface TestimonialCardData {
  id: number;
  reviewer_name: string;
  reviewer_role: string;
  reviewer_image_url: string;
  comment: string;
  rating: number;
}

// Shared star-rated review card — used both on a single program's "Learner Testimonials" (see
// program-testimonials.tsx) and the home page's cross-program review feed, which additionally
// shows which program the review is for via `subtitle`.
//
// The comment sits in a fixed-height block (line-clamp-4 AND a matching min-height) rather than
// just clamping — clamping alone still lets a one-line comment leave a shorter card than a
// four-line one, so the avatar/name/course row below it would land at a different height from
// card to card. No "read more" toggle on purpose: expanding in place would reintroduce exactly
// that misalignment for whichever card was expanded.
export function TestimonialCard({
  testimonial,
  subtitle,
  className = "w-72 shrink-0 snap-start sm:w-80",
}: {
  testimonial: TestimonialCardData;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-2xl border border-gray-100 bg-white p-6 text-left ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} filled={n <= testimonial.rating} />
        ))}
      </div>
      <p className="mt-4 line-clamp-4 min-h-20 text-sm text-gray-600">
        &ldquo;{testimonial.comment}&rdquo;
      </p>
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
          {subtitle && <p className="truncate text-xs text-secondary">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
