"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePrograms } from "@/hooks/queries/programs";
import { useCohorts } from "@/hooks/queries/cohort";
import { nextOpenCohortForProgram } from "@/types/cohort";
import { ProgramCard } from "@/components/marketing/program-card";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Reveal, staggerDelay } from "@/components/motion/reveal";
import { partnerPageCopy } from "@/lib/referral-partners";

function HandshakeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2 7.5l3-2 3.5 2.5-2 2a1.4 1.4 0 002 2l3-3 3 2-2.5 2.5a2 2 0 01-2.8 0"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 5.5L2 7.5v4l3 2M15 5.5l3 2v4l-3 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const copy = partnerPageCopy(slug);
  const [page, setPage] = useState(1);

  const { data: programs, isLoading, isError, error } = usePrograms({ referral_partner: slug, page });
  const { data: cohortsData } = useCohorts();

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Partner link not found</h1>
        <p className="mt-3 text-sm text-gray-500">
          {error?.message ?? `We couldn't find a partnership at "${slug}". Double-check the link, or reach out and we'll help you find the right one.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/programms"
            className="rounded-full bg-main px-6 py-3 text-sm font-medium text-white hover:bg-deep-blue"
          >
            Browse All Programs →
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Contact Us
          </Link>
        </div>
      </div>
    );
  }

  const programItems = programs?.results ?? [];
  const totalCount = programs?.count ?? programItems.length;
  const totalPages = programs?.total_pages ?? 1;

  return (
    <div>
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <Reveal className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
              <HandshakeIcon />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-glass">{copy.tagline}</p>
          </div>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-white/70">{copy.description}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {!isLoading && (
          <p className="text-sm text-gray-400">
            {totalCount} program{totalCount === 1 ? "" : "s"} available with your partner pricing
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && <CardGridSkeleton count={8} />}
          {!isLoading && programItems.length === 0 && (
            <p className="text-sm text-gray-400">No programs are available for this partnership yet.</p>
          )}
          {programItems.map((program, i) => (
            <Reveal key={program.id} delay={staggerDelay(i)} className="[&>*]:h-full">
              <ProgramCard
                program={program}
                buttonTone="blue"
                cohort={nextOpenCohortForProgram(cohortsData?.results ?? [], program.id)}
              />
            </Reveal>
          ))}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex justify-end">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
          <h2 className="text-base font-semibold text-gray-900">Ready to enrol?</h2>
          <p className="mt-2 text-sm text-gray-500">
            When you check out, enter your partner discount code in the coupon field to apply your
            member pricing. Don&apos;t have your code? Reach out and we&apos;ll get you sorted.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Speak to an Advisor
          </Link>
        </div>
      </section>
    </div>
  );
}
