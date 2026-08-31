import Link from "next/link";
import { PublicProgramListing } from "@/types/programs";
import { displayTitle, formatShortDate, formatUsd } from "@/lib/format";

interface ProgramCardProps {
  program: PublicProgramListing;
  buttonTone?: "cyan" | "blue";
}

function nextOpenCohort(program: PublicProgramListing) {
  return [...program.cohorts]
    .filter((c) => c.is_enrollment_open && !c.is_sold_out)
    .sort((a, b) => a.starts_on.localeCompare(b.starts_on))[0];
}

export function ProgramCard({ program, buttonTone = "cyan" }: ProgramCardProps) {
  const badge = program.has_pmi_badge
    ? "PMI Authorized"
    : program.has_pecb_badge
      ? "PECB Authorized"
      : program.level_display;
  const buttonClass = buttonTone === "cyan" ? "bg-glass text-deep-blue" : "bg-secondary text-white";
  const cohort = nextOpenCohort(program);

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-main to-deep-blue p-5 text-white">
      <div>
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          {badge}
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-glass">
          {program.code} Certification
        </p>
        <h3 className="mt-1 text-base font-semibold">{displayTitle(program.title)}</h3>
        <p className="mt-2 text-sm text-white/70 line-clamp-3">{program.summary}</p>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80">
            {cohort ? `Starts ${formatShortDate(cohort.starts_on)}` : "Cohort dates coming soon"}
          </p>
          <p className="text-sm font-semibold text-white">{formatUsd(program.base_price_usd)}</p>
        </div>
        {cohort?.is_nearly_full && (
          <p className="mt-2 text-xs text-amber-300">
            Only {cohort.seat_capacity - cohort.seats_taken} seats left
          </p>
        )}
        <Link
          href={`/programms/${program.slug}`}
          className={`mt-3 flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 ${buttonClass}`}
        >
          Learn More →
        </Link>
      </div>
    </div>
  );
}
