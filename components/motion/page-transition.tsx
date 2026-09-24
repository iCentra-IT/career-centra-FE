"use client";

import { usePathname } from "next/navigation";

// Keyed by pathname so every route change remounts the wrapper and replays the CSS fade-in. Plain
// CSS (not motion) on purpose: it needs no JS to run, so there's no flash of hidden content before
// hydration. (A template.tsx would only remount for its own segment, not deeper navigations.)
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="motion-safe:animate-page-in">
      {children}
    </div>
  );
}
