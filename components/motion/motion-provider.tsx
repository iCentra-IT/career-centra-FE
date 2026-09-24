"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

// LazyMotion + the lightweight `m` components (see reveal.tsx) keep the animation runtime small —
// only DOM animations (no drag/layout) are loaded. reducedMotion="user" makes every animation
// honour the visitor's OS-level "reduce motion" setting automatically.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
