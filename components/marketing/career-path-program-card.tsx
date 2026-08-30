import Link from "next/link";
import { ProgramListItem } from "@/types/programs";
import { displayTitle } from "@/lib/format";

interface CareerPathProgramCardProps {
  program: ProgramListItem;
  buttonTone?: "cyan" | "blue";
}

export function CareerPathProgramCard({ program, buttonTone = "cyan" }: CareerPathProgramCardProps) {
  const badge = program.has_pmi_badge
    ? "PMI Authorized"
    : program.has_pecb_badge
      ? "PECB Authorized"
      : program.level_display;
  const buttonClass = buttonTone === "cyan" ? "bg-glass text-deep-blue" : "bg-secondary text-white";

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
        <p className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80">
          {program.next_cohort ? `Next cohort - ${program.next_cohort}` : "Cohort dates coming soon"}
        </p>
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
