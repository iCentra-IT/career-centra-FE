"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProgram } from "@/hooks/queries/programs";
import { useCohortsByProgram } from "@/hooks/queries/cohort";
import { useRelatedPathPrograms } from "@/hooks/queries/career-paths";
import type { Cohort } from "@/types/cohort";
import { programOrCohortPrice } from "@/types/programs";
import { displayTitle, formatShortDate, formatMoney } from "@/lib/format";
import { PATHWAY_CATEGORIES } from "@/lib/pathways";
import { getYouTubeVideoId } from "@/lib/youtube";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailPageSkeleton } from "@/components/ui/skeleton";
import { EnrolButton } from "@/components/marketing/enrol-button";
import { AddToCartButton } from "@/components/marketing/add-to-cart-button";
import { CareerPathProgramCard } from "@/components/marketing/career-path-program-card";
import { ReviewVideo } from "@/components/marketing/review-video";
import { ProgramTestimonials } from "@/components/marketing/program-testimonials";
import {
  FacilitatorAvatar,
  FacilitatorDetailModal,
  type FacilitatorDetail,
} from "@/components/marketing/facilitator-detail";

const TABS = [
  { label: "Learning Outcome", id: "learning-outcomes" },
  { label: "Audience", id: "audience" },
  { label: "Requirements", id: "requirements" },
  { label: "Course Content", id: "course-content" },
  { label: "Certification", id: "certification" },
  { label: "Testimonials", id: "reviews" },
  { label: "FAQs", id: "faq" },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="#0c236c" strokeWidth="1.3" />
      <path d="M5 8.2l2 2 4-4.4" stroke="#0c236c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 text-gray-400">
      <path d="M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {!open && <path d="M7 2v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
    </svg>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{children}</p>;
}

// Compact "10–14 Feb 2025" for a same-month cohort instead of repeating the month/year on both
// ends; falls back to the full range when the cohort spans two different months.
function formatCohortDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    const month = end.toLocaleDateString("en-GB", { month: "short" });
    return `${start.getDate()}–${end.getDate()} ${month} ${end.getFullYear()}`;
  }
  return `${formatShortDate(startIso)} – ${formatShortDate(endIso)}`;
}

export function ProgramDetailContent({ slug }: { slug: string }) {
  const { data: program, isLoading } = useProgram(slug);
  // /api/programs/ doesn't embed cohorts (confirmed by a runtime crash — see types/programs.ts),
  // so a program's scheduled cohorts come from /api/cohorts/ instead, filtered to this program.
  const { data: cohortsData } = useCohortsByProgram(program?.id);
  const { path: careerPath, related: relatedPrograms } = useRelatedPathPrograms(slug);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>(TABS[0].id);
  const [selectedFacilitator, setSelectedFacilitator] = useState<FacilitatorDetail | null>(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Measure the sticky marketing header's real height so the tab bar sticks flush beneath it —
  // the header is a different height on mobile (single row) vs desktop (two rows).
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;

    const updateOffset = () => setHeaderOffset(header.getBoundingClientRect().height);
    updateOffset();

    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Highlight whichever tab's section has scrolled up past the sticky tab bar.
  useEffect(() => {
    const elements = TABS.map((tab) => document.getElementById(tab.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (elements.length === 0) return;

    const updateActiveTab = () => {
      const offset = (tabBarRef.current?.getBoundingClientRect().bottom ?? 0) + 8;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= offset) current = el.id;
      }
      setActiveTabId(current);
    };

    updateActiveTab();
    window.addEventListener("scroll", updateActiveTab, { passive: true });
    window.addEventListener("resize", updateActiveTab);
    return () => {
      window.removeEventListener("scroll", updateActiveTab);
      window.removeEventListener("resize", updateActiveTab);
    };
  }, [program]);

  // Cross-check by program id as a safety net in case the backend doesn't honor the `program`
  // filter param useCohortsByProgram sends.
  const programCohorts = (cohortsData?.results ?? [])
    .filter((c) => c.program.id === program?.id)
    .sort((a, b) => a.starts_on.localeCompare(b.starts_on));
  const [currentCohort, nextCohort] = programCohorts;

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!program) {
    return <div className="px-6 py-20 text-center text-sm text-gray-400">Program not found.</div>;
  }

  const pathwayLabel =
    PATHWAY_CATEGORIES.find((p) => p.programType === program.program_type)?.label ?? program.program_type;

  const durationDays = currentCohort
    ? Math.round(
        (new Date(currentCohort.ends_on).getTime() - new Date(currentCohort.starts_on).getTime()) /
          86_400_000,
      )
    : null;

  // program.facilitators has come back empty on every program seen so far — the confirmed source
  // of facilitator info is the cohort (facilitator_name), not the program itself.
  const leadFacilitator = program.facilitators?.[0];
  const cohortFacilitatorName = currentCohort?.facilitator_name;
  const price = programOrCohortPrice(program.pricing_mode, program, currentCohort);

  const reviewVideos = (program.reviews ?? [])
    .map((review) => ({ id: review.id, videoId: getYouTubeVideoId(review.video_url) }))
    .filter((review): review is { id: number; videoId: string } => !!review.videoId);

  const cartItemFor = (cohort: Cohort) => {
    const cohortPrice = programOrCohortPrice(program.pricing_mode, program, cohort);
    return {
      programId: program.id,
      slug: program.slug,
      title: program.title,
      summary: program.summary,
      badge: program.has_pmi_badge
        ? "PMI Authorized"
        : program.has_pecb_badge
          ? "PECB Authorized"
          : program.has_icentra_badge
            ? "iCentra Authorized"
            : program.level_display,
      code: program.code,
      priceAmount: cohortPrice.amount,
      priceCurrency: cohortPrice.currency,
      cohortId: cohort.id,
      cohortStartsOn: cohort.starts_on,
    };
  };

  return (
    <div>
      <section
        className="relative overflow-hidden bg-linear-to-br from-main to-deep-blue bg-cover bg-center px-6 py-14 text-white"
        // style={
        //   program.cover_image_url
        //     ? { backgroundImage: `url("${program.cover_image_url}")` }
        //     : undefined
        // }
      >
        {/* When a cover image is set it sits behind this same gradient, tinted rather than solid so
            the photo actually reads through it while the hero text stays legible; with no image
            the gradient alone fills the section, same as before. */}
        {program.cover_image_url && (
          <div
            className="absolute inset-0 bg-linear-to-br from-main/65 to-deep-blue/80"
            aria-hidden="true"
          />
        )}
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm text-white/60">
              <Link href="/" className="hover:text-white">
                Home
              </Link>{" "}
              ›{" "}
              <Link href="/career-paths" className="hover:text-white">
                Career Paths
              </Link>{" "}
              › {pathwayLabel} › {program.code}
            </p>
            {program.badge_image_url && (
              // eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for
              <img
                src={program.badge_image_url}
                alt={`${program.title} badge`}
                className="mt-4 h-24 w-24 rounded-full object-contain bg-white/10 p-2"
              />
            )}
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{displayTitle(program.title)}</h1>
            <p className="mt-3 max-w-xl text-white/70">{program.summary}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
              {durationDays && <span>{durationDays} days live training</span>}
              {currentCohort && <span>Current Cohort: {formatShortDate(currentCohort.starts_on)}</span>}
              <span>{program.level_display}</span>
              <span>{program.audience_display}</span>
            </div>

            {leadFacilitator ? (
              <button
                type="button"
                onClick={() => setSelectedFacilitator(leadFacilitator)}
                className="mt-6 flex max-w-lg items-start gap-4 rounded-xl bg-white/10 p-4 text-left hover:bg-white/15"
              >
                <FacilitatorAvatar facilitator={leadFacilitator} className="h-12 w-12 shrink-0 rounded-full text-xs" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-glass">
                    Lead Instructor
                  </p>
                  <p className="font-semibold">
                    {displayTitle(leadFacilitator.full_name)}
                    {leadFacilitator.credential_tags.length > 0 &&
                      `, ${leadFacilitator.credential_tags.join(", ")}`}
                  </p>
                  {leadFacilitator.short_bio && (
                    <p className="line-clamp-2 text-xs text-white/60">{leadFacilitator.short_bio}</p>
                  )}
                </div>
              </button>
            ) : (
              cohortFacilitatorName && (
                <div className="mt-6 flex max-w-lg items-center gap-4 rounded-xl bg-white/10 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                    {cohortFacilitatorName[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-glass">
                      Lead Instructor
                    </p>
                    <p className="font-semibold">{cohortFacilitatorName}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 text-gray-900">
            <p className="text-3xl font-bold text-main">{formatMoney(price.amount, price.currency)}</p>
            <p className="text-xs text-gray-400">per person</p>

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm">
              {currentCohort && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Current cohort</span>
                  <span className="font-medium text-gray-900">{formatShortDate(currentCohort.starts_on)}</span>
                </div>
              )}
              {nextCohort && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Cohort</span>
                  <span className="font-medium text-gray-900">{formatShortDate(nextCohort.starts_on)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Level</span>
                <span className="font-medium text-gray-900">{program.level_display}</span>
              </div>
              {currentCohort && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Seats remaining</span>
                  <span className="font-medium text-gray-900">
                    {currentCohort.seat_capacity - currentCohort.seats_taken} of {currentCohort.seat_capacity}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <EnrolButton
                cohortId={currentCohort?.id}
                enrollmentOpen={currentCohort?.is_enrollment_open}
                withCoupon
                className="w-full rounded-md bg-main px-4 py-3 text-center text-sm font-semibold text-white hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enrol Now
              </EnrolButton>
              <Link
                href="/contact"
                className="rounded-md border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Speak to an Advisor
              </Link>
              {currentCohort && <AddToCartButton item={cartItemFor(currentCohort)} />}
            </div>
          </div>
        </div>
      </section>

      <div
        ref={tabBarRef}
        className="sticky z-20 border-b border-gray-100 bg-white px-6"
        style={{ top: headerOffset }}
      >
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto text-sm">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={() => setActiveTabId(tab.id)}
              className={`whitespace-nowrap border-b-2 py-3 ${
                activeTabId === tab.id
                  ? "border-main font-medium text-main"
                  : "border-transparent text-gray-500 hover:text-main"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {program?.learning_outcomes?.length > 0 && (
          <section id="learning-outcomes" className="scroll-mt-32 py-6">
            <SectionEyebrow>What You Will Learn</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Learning Outcomes</h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {program.learning_outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckIcon />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        )}

        {program?.who_should_attend?.length > 0 && (
          <section id="audience" className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>Audience</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Who Should Attend</h2>
            <ul className="mt-5 flex flex-col gap-2.5">
              {program.who_should_attend.map((item) => (
                <li key={item} className="border-b border-gray-50 pb-2.5 text-sm text-gray-600 last:border-0">
                  • {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {program?.prerequisites?.length > 0 && (
          <section id="requirements" className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>Requirements</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Prerequisites</h2>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-100 p-5">
              {[...program.prerequisites]
                .sort((a, b) => a.order - b.order)
                .map((req) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <StatusBadge
                      label={req.kind === "required" ? "Required" : "Recommended"}
                      tone={req.kind === "required" ? "purple" : "gray"}
                    />
                    <span className="text-sm text-gray-600">{req.text}</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {program?.modules?.length > 0 && (
          <section id="course-content" className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>Course Content</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Course Module</h2>
            <div className="mt-5 flex flex-col gap-2">
              {[...program.modules]
                .sort((a, b) => a.order - b.order)
                .map((module, i) => {
                  const open = openModule === i;
                  return (
                    <div key={module.id} className="rounded-xl border border-gray-100">
                      <button
                        type="button"
                        onClick={() => setOpenModule(open ? null : i)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                              open ? "border-main bg-main" : "border-gray-300"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-900">{module.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{module.lesson_count} lessons</span>
                          <PlusMinusIcon open={open} />
                        </div>
                      </button>
                      {open && module.lessons.length > 0 && (
                        <div className="flex flex-col gap-1.5 px-11 pb-4">
                          {[...module.lessons]
                            .sort((a, b) => a.order - b.order)
                            .map((lesson, li) => (
                              <p key={lesson.id} className="text-sm text-gray-500">
                                Lesson {li + 1}: {lesson.title}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {program?.certification && (
          <section id="certification" className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>Certification</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">{program.certification.name}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl border border-gray-100 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Exam Format</p>
                <p className="mt-1 text-sm text-gray-700">{program.certification.exam_format}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Duration</p>
                <p className="mt-1 text-sm text-gray-700">{program.certification.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Delivery</p>
                <p className="mt-1 text-sm text-gray-700">{program.certification.delivery}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Pass Rate With Our Prep
                </p>
                <p className="mt-1 text-sm text-gray-700">{program.certification.pass_rate}</p>
              </div>
            </div>
          </section>
        )}

        <section className="scroll-mt-32 border-t border-gray-100 py-6">
          <SectionEyebrow>Upcoming Cohorts</SectionEyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Course Schedule</h2>
          {programCohorts.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Add a cohort to your cart to apply a coupon code at checkout.
            </p>
          )}
          {programCohorts.length === 0 ? (
            <p className="mt-5 text-sm text-gray-400">No upcoming cohorts scheduled yet.</p>
          ) : (
            <>
              {/* Mobile: one card per cohort */}
              <div className="mt-5 flex flex-col gap-3 sm:hidden">
                {programCohorts.map((cohort) => {
                  const seatsLeft = cohort.seat_capacity - cohort.seats_taken;
                  const cohortPrice = programOrCohortPrice(program.pricing_mode, program, cohort);
                  return (
                    <div key={cohort.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-base font-semibold text-gray-900">
                          {formatCohortDateRange(cohort.starts_on, cohort.ends_on)}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            cohort.is_nearly_full ? "bg-red-500 text-white" : "bg-deep-blue text-white"
                          }`}
                        >
                          {seatsLeft} left
                        </span>
                      </div>
                      <div className="mt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                        <p>
                          <span className="text-gray-400">Facilitator:</span>{" "}
                          {cohort.facilitator_name || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Price:</span>{" "}
                          <span className="font-semibold text-main">
                            {formatMoney(cohortPrice.amount, cohortPrice.currency)}
                          </span>
                        </p>
                      </div>
                      <AddToCartButton
                        item={cartItemFor(cohort)}
                        className="mt-4 block w-full rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table */}
              <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-gray-100 sm:block">
                <table className="w-full min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                      <th className="px-5 py-3 font-medium">Dates</th>
                      <th className="px-5 py-3 font-medium">Facilitator</th>
                      <th className="px-5 py-3 font-medium">Seats</th>
                      <th className="px-5 py-3 font-medium">Price</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {programCohorts.map((cohort) => {
                      const cohortPrice = programOrCohortPrice(program.pricing_mode, program, cohort);
                      return (
                        <tr key={cohort.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-5 py-4 text-gray-900">
                            {formatShortDate(cohort.starts_on)} – {formatShortDate(cohort.ends_on)}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {cohort.facilitator_name || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                              {cohort.seat_capacity - cohort.seats_taken} left
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-900">
                            {formatMoney(cohortPrice.amount, cohortPrice.currency)}
                          </td>
                          <td className="px-5 py-4">
                            <AddToCartButton
                              item={cartItemFor(cohort)}
                              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section id="reviews" >
          {/* <SectionEyebrow>Reviews</SectionEyebrow> */}
          {/* <h2 className="mt-1 text-2xl font-semibold text-gray-900">Learner Reviews</h2> */}
          {/* Video reviews are on hold for now — the "Testimonials" tab is text+star reviews only.
          {reviewVideos.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviewVideos.map((review) => (
                <ReviewVideo key={review.id} videoId={review.videoId} />
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-gray-400">No video reviews yet.</p>
          )}
          */}

          <ProgramTestimonials slug={slug} />
        </section>

        {program?.faqs?.length > 0 && (
          <section id="faq" className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <div className="mt-5 flex flex-col gap-2">
              {program.faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="rounded-xl border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-gray-900"
                    >
                      {faq.question}
                      <PlusMinusIcon open={open} />
                    </button>
                    {open && faq.answer && (
                      <p className="px-4 pb-4 text-sm text-gray-500">{faq.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {relatedPrograms.length > 0 && (
          <section className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>Other Courses</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
              {careerPath ? `More in ${displayTitle(careerPath.title)}` : "Related courses"}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPrograms.slice(0, 4).map((related) => (
                <CareerPathProgramCard key={related.id} program={related} buttonTone="blue" />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedFacilitator && (
        <FacilitatorDetailModal
          facilitator={selectedFacilitator}
          onClose={() => setSelectedFacilitator(null)}
        />
      )}
    </div>
  );
}
