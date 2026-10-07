"use client";

import { useActiveLeadMagnet } from "@/hooks/queries/crm";
import { LeadMagnetGate } from "@/components/marketing/lead-magnet-gate";

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 14.5V16a1 1 0 001 1h11a1 1 0 001-1v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// The one lead magnet currently promoted site-wide — null when staff haven't marked one active.
// Renders nothing in that case rather than an empty slot.
export function ActiveLeadMagnetBanner({ className = "" }: { className?: string }) {
  const { data: magnet, isLoading } = useActiveLeadMagnet();
  if (isLoading || !magnet) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 p-5 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <DownloadIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-glass">Free download</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{magnet.title}</p>
          {magnet.description && <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{magnet.description}</p>}
        </div>
      </div>
      <LeadMagnetGate slug={magnet.slug}>
        <span className="inline-flex shrink-0 rounded-full bg-glass px-5 py-2.5 text-sm font-medium text-deep-blue hover:opacity-90">
          Get it free
        </span>
      </LeadMagnetGate>
    </div>
  );
}
