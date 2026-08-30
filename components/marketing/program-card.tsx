import Link from "next/link";
import { PublicProgramListing } from "@/types/programs";
import { displayTitle, formatShortDate, formatUsd } from "@/lib/format";

interface ProgramCardProps {
  program: PublicProgramListing;
  buttonTone?: "cyan" | "blue";
}

export function ProgramCard({ program, buttonTone = "cyan" }: ProgramCardProps) {
  const badge = program.program.accreditations[0]?.label ?? program.program.level;
  const buttonClass = buttonTone === "cyan" ? "bg-glass text-deep-blue" : "bg-secondary text-white";

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-main to-deep-blue p-5 text-white">
      <div>
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium capitalize">
          {badge}
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-glass">
          {program.program.program_type}
        </p>
        <h3 className="mt-1 text-base font-semibold">{displayTitle(program.program.title)}</h3>
        <p className="mt-2 text-sm text-white/70 line-clamp-3">{program.program.summary}</p>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80">
            {program.is_enrollment_open
              ? `Starts ${formatShortDate(program.starts_on)}`
              : "Enrollment closed"}
          </p>
          <p className="text-sm font-semibold text-white">{formatUsd(program.effective_price_usd)}</p>
        </div>
        {program.is_nearly_full && !program.is_sold_out && (
          <p className="mt-2 text-xs text-amber-300">Only {program.seats_remaining} seats left</p>
        )}
        {program.is_sold_out && <p className="mt-2 text-xs text-red-300">Sold out</p>}
        <Link
          href={`/programms/${program.program.slug}`}
          className={`mt-3 flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 ${buttonClass}`}
        >
          Learn More →
        </Link>
      </div>
    </div>
  );
}
