import Link from "next/link";
import { ProgramListItem, programOrCohortPrice } from "@/types/programs";
import type { Cohort } from "@/types/cohort";
import { displayTitle, formatShortDate, formatMoney } from "@/lib/format";
import { BadgeIcon } from "@/components/ui/badge-icon";

interface CareerPathProgramCardProps {
  program: ProgramListItem;
  buttonTone?: "cyan" | "blue";
  // Same story as ProgramCard: the program object itself carries no live cohort data (next_cohort
  // has come back null/unreliable on every capture), so the caller fetches /api/cohorts/
  // separately and passes the next open one here (see types/cohort.ts's nextOpenCohortForProgram).
  cohort?: Cohort;
}

export function CareerPathProgramCard({ program, buttonTone = "cyan", cohort }: CareerPathProgramCardProps) {
  const badge = program.has_pmi_badge
    ? "PMI Authorized"
    : program.has_pecb_badge
      ? "PECB Authorized"
      : program.has_icentra_badge
        ? "iCentra Authorized"
        : program.level_display;
  const buttonClass = buttonTone === "cyan" ? "bg-glass text-deep-blue" : "bg-secondary text-white";
  const price = programOrCohortPrice(program.pricing_mode, program, cohort);

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-main to-deep-blue p-5 text-white">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          <BadgeIcon />
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
          <p className="text-sm font-semibold text-white">{formatMoney(price.amount, price.currency)}</p>
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
