import Link from "next/link";
import { PublicProgramListing, programOrCohortPrice } from "@/types/programs";
import type { Cohort } from "@/types/cohort";
import { displayTitle, formatShortDate, formatMoney } from "@/lib/format";
import { BadgeIcon } from "@/components/ui/badge-icon";

interface ProgramCardProps {
  program: PublicProgramListing;
  buttonTone?: "cyan" | "blue";
  // GET /api/programs/ doesn't embed cohorts itself (confirmed by a runtime crash on
  // program.cohorts — see types/programs.ts), so the caller fetches /api/cohorts/ separately and
  // passes the next open one here (see types/cohort.ts's nextOpenCohortForProgram). Falls back to
  // the catalog base price and a generic "coming soon" label when there isn't one.
  cohort?: Cohort;
}

export function ProgramCard({ program, buttonTone = "cyan", cohort }: ProgramCardProps) {
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
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-main to-deep-blue bg-cover bg-center p-5 text-white"
      // style={
      //   program.cover_image_url
      //     ? { backgroundImage: `url("${program.cover_image_url}")` }
      //     : undefined
      // }
    >
      {/* When a cover image is set it sits behind this same gradient, tinted rather than solid so
          the photo actually reads through it while the card text stays legible; with no image the
          gradient alone fills the card, same as before. */}
      {program.cover_image_url && (
        <div
          className="absolute inset-0 bg-linear-to-br from-main/65 to-deep-blue/80"
          aria-hidden="true"
        />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <BadgeIcon />
              {badge}
            </span>
            {program.is_bestseller && (
              <span className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-deep-blue">
                Bestseller
              </span>
            )}
          </div>
          {program.badge_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for
            <img
              src={program.badge_image_url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full bg-white/10 object-contain p-1.5"
            />
          )}
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-glass">
          {program.code} Certification
        </p>
        <h3 className="mt-1 text-base font-semibold">{displayTitle(program.title)}</h3>
        <p className="mt-2 text-sm text-white/70 line-clamp-3">{program.summary}</p>
      </div>
      <div className="relative mt-6">
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
