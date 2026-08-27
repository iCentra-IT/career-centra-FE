"use client";

import { useState } from "react";
import Link from "next/link";
import { useProgram } from "@/hooks/queries/programs";
import { useCohorts } from "@/hooks/queries/cohort";
import { displayTitle, formatShortDate, formatUsd } from "@/lib/format";
import { PATHWAY_CATEGORIES } from "@/lib/pathways";
import { StatusBadge } from "@/components/ui/status-badge";

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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{children}</p>;
}

export function ProgramDetailContent({ slug }: { slug: string }) {
  const { data: program, isLoading } = useProgram(slug);
  const { data: cohorts } = useCohorts();
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const programCohorts = (cohorts?.results ?? [])
    .filter((c) => c.program.slug === slug)
    .sort((a, b) => a.starts_on.localeCompare(b.starts_on));
  const [currentCohort, nextCohort] = programCohorts;

  if (isLoading) {
    return <div className="px-6 py-20 text-center text-sm text-gray-400">Loading…</div>;
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

  const leadFacilitator = program.facilitators?.[0];

  return (
    <div>
      <section className="bg-gradient-to-br from-main to-deep-blue px-6 py-14 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
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
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{displayTitle(program.title)}</h1>
            <p className="mt-3 max-w-xl text-white/70">{program.summary}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
              {durationDays && <span>{durationDays} days live training</span>}
              {currentCohort && <span>Current Cohort: {formatShortDate(currentCohort.starts_on)}</span>}
              <span>{program.level_display}</span>
              <span>{program.audience_display}</span>
            </div>

            {leadFacilitator && (
              <div className="mt-6 flex max-w-lg items-center gap-4 rounded-xl bg-white/10 p-4">
                {leadFacilitator.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={leadFacilitator.avatar_url}
                    alt={displayTitle(leadFacilitator.full_name)}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                    {displayTitle(leadFacilitator.full_name)?.[0] ?? "?"}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-glass">
                    Lead Instructor
                  </p>
                  <p className="font-semibold">
                    {displayTitle(leadFacilitator.full_name)}
                    {leadFacilitator.credential_tags.length > 0 &&
                      `, ${leadFacilitator.credential_tags.join(", ")}`}
                  </p>
                  {leadFacilitator.short_bio && (
                    <p className="text-xs text-white/60">{leadFacilitator.short_bio}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 text-gray-900">
            <p className="text-3xl font-bold text-main">{formatUsd(program.base_price_usd)}</p>
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
                    {currentCohort.seats_remaining} of {currentCohort.seat_capacity}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/login"
                className="rounded-md bg-main px-4 py-3 text-center text-sm font-semibold text-white hover:bg-deep-blue"
              >
                Enrol Now
              </Link>
              <Link
                href="/contact"
                className="rounded-md border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Speak to an Advisor
              </Link>
              <button
                type="button"
                disabled
                title="Cart isn't available yet"
                className="text-center text-sm text-gray-300 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[105px] z-20 border-b border-gray-100 bg-white px-6">
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto text-sm">
          {TABS.map((tab, i) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={`whitespace-nowrap border-b-2 py-3 ${
                i === 0
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
          {programCohorts.length === 0 ? (
            <p className="mt-5 text-sm text-gray-400">No upcoming cohorts scheduled yet.</p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-100">
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
                  {programCohorts.map((cohort) => (
                    <tr key={cohort.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-4 text-gray-900">
                        {formatShortDate(cohort.starts_on)} – {formatShortDate(cohort.ends_on)}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{cohort.facilitator_name}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                          {cohort.seats_remaining} left
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-900">{formatUsd(cohort.effective_price_usd)}</td>
                      <td className="px-5 py-4">
                        <Link
                          href="/login"
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Enrol
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="reviews" className="scroll-mt-32 border-t border-gray-100 py-6">
          <SectionEyebrow>Reviews</SectionEyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Learner Reviews</h2>
          <p className="mt-5 text-sm text-gray-400">
            No reviews yet — there&apos;s no reviews system connected for this program.
          </p>
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
      </div>
    </div>
  );
}
