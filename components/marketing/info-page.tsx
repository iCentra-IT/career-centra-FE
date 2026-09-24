import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

// Shared building blocks for the long-form brand pages (About, Why CareerCentra, Partnerships) —
// same hero gradient, eyebrow/heading rhythm and CTA band the home page already uses, kept in one
// place so the three pages stay visually identical.

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5 8.2l2 2 4-4.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoHero({
  crumb,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  crumb: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 ${
          children ? "lg:grid-cols-[1.2fr_1fr]" : ""
        }`}
      >
        <Reveal>
          <p className="text-sm text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            › {crumb}
          </p>
          <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            {eyebrow}
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-white/70">{subtitle}</p>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <Reveal className={centered ? "text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className={`mt-3 max-w-2xl text-sm text-gray-500 ${centered ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </Reveal>
  );
}

export function CtaBand({
  title,
  description,
  primary,
  secondary,
}: {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <Reveal className="rounded-3xl bg-main px-8 py-14 text-center text-white">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={primary.href}
            className="rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90"
          >
            {primary.label} →
          </Link>
          <Link
            href={secondary.href}
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
          >
            {secondary.label}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
