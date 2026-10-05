import Link from "next/link";

// Shared look for dashboard home pages (admin, facilitator, student, marketer): a greeting hero,
// rounded cards with a consistent header row, and small metric tiles. Pages keep their own data.

export function greetingFor(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative flex flex-wrap items-end justify-between gap-6 overflow-hidden rounded-3xl bg-linear-to-br from-main to-deep-blue p-7 text-white shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-glass/20 blur-3xl"
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-glass">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-white/70">{subtitle}</p>}
      </div>
      {children && <div className="relative flex flex-wrap gap-2">{children}</div>}
    </section>
  );
}

export function HeroButton({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "rounded-full bg-glass px-4 py-2 text-sm font-medium text-deep-blue hover:opacity-90"
          : "rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      }
    >
      {children}
    </Link>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
          {action && (
            <Link href={action.href} className="text-xs font-medium text-secondary hover:underline">
              {action.label} →
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function MetricTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warn" | "good";
}) {
  const toneClass =
    tone === "warn" ? "bg-red-50 text-red-600" : tone === "good" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-900";
  return (
    <div className={`rounded-xl p-4 text-center ${toneClass}`}>
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">{children}</p>;
}
