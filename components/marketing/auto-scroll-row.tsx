import type { ReactNode } from "react";

// Continuously scrolls its children edge to edge, looping seamlessly, instead of relying on the
// visitor to drag/swipe a manual scrollbar. Pure CSS (the --animate-marquee keyframe in
// globals.css) — content is duplicated once so animating exactly -50% loops with no jump, and the
// duplicate is aria-hidden so screen readers don't hear every card twice. Pauses on hover so a
// visitor can actually read a card, and under prefers-reduced-motion falls back to the original
// plain horizontal scroll-snap row (no duplicate content, no animation).
export function AutoScrollRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`group/marquee overflow-x-hidden motion-reduce:overflow-x-auto motion-reduce:snap-x motion-reduce:snap-mandatory ${className}`}
    >
      <div className="flex w-max gap-5 motion-safe:animate-marquee motion-safe:group-hover/marquee:[animation-play-state:paused]">
        <div className="flex shrink-0 gap-5">{children}</div>
        <div className="flex shrink-0 gap-5 motion-reduce:hidden" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
