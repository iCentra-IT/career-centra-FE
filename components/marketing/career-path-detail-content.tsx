"use client";

import { useState } from "react";
import Link from "next/link";
import { useCareerPath } from "@/hooks/queries/career-paths";
import { CareerPathProgramCard } from "@/components/marketing/career-path-program-card";
import { DetailPageSkeleton } from "@/components/ui/skeleton";
import { displayTitle } from "@/lib/format";

const TABS = [
  { label: "Overview", id: "hero" },
  { label: "Who It Is For", id: "who-it-is-for" },
  { label: "Career Pathway", id: "career-pathway" },
  { label: "Programs", id: "programs" },
  { label: "Outcomes", id: "outcomes" },
  { label: "Testimonials", id: "testimonials" },
  { label: "FAQs", id: "faqs" },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="#0c236c" strokeWidth="1.3" />
      <path d="M5 8.2l2 2 4-4.4" stroke="#0c236c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{children}</p>;
}

export function CareerPathDetailContent({ slug }: { slug: string }) {
  const { data: pathway, isLoading } = useCareerPath(slug);
  const [levelFilter, setLevelFilter] = useState<string>("");

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!pathway) {
    return <div className="px-6 py-20 text-center text-sm text-gray-400">Career path not found.</div>;
  }

  const visiblePrograms = levelFilter
    ? pathway.programs.filter((p) => p.level_display === levelFilter)
    : pathway.programs;

  const title = displayTitle(pathway.title);

  return (
    <div>
      <section id="hero" className="scroll-mt-24 bg-gradient-to-br from-main to-deep-blue px-6 py-14 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-xl text-white/70">{pathway.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registration"
                className="rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90"
              >
                Start Your Path →
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Speak to an Advisor
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-4 text-gray-900">
              <p className="text-2xl font-bold">{pathway.programs.length}</p>
              <p className="text-xs text-gray-400">Programs</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-gray-900">
              <p className="text-2xl font-bold">{pathway.levels.length}</p>
              <p className="text-xs text-gray-400">Learning Levels</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-gray-900">
              <p className="text-2xl font-bold">{pathway.suitable_roles.length}</p>
              <p className="text-xs text-gray-400">Suitable Roles</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-gray-900">
              <p className="text-2xl font-bold">{pathway.certifications.length}</p>
              <p className="text-xs text-gray-400">Certifications</p>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white px-6">
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
        {pathway.suitable_roles.length > 0 && (
          <section id="who-it-is-for" className="scroll-mt-32 py-6">
            <SectionEyebrow>Who This Is For</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Is This Path Right for You?</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pathway.suitable_roles.map((role) => (
                <div key={role} className="flex items-center gap-2 rounded-xl border border-gray-100 p-4">
                  <CheckIcon />
                  <span className="text-sm text-gray-700">{role}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {pathway.certifications.length > 0 && (
          <section id="career-pathway" className="scroll-mt-32 border-t border-gray-100 py-6">
            <SectionEyebrow>Career Pathway</SectionEyebrow>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Learning Path</h2>
            <div className="mt-5 rounded-2xl border border-gray-100 p-6">
              <span className="inline-flex rounded-full bg-main px-3 py-1 text-xs font-medium text-white">
                Learning Path
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {pathway.certifications.map((cert, i) => (
                  <div key={cert} className="flex items-center gap-2">
                    <span className="rounded-md bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary">
                      {cert}
                    </span>
                    {i < pathway.certifications.length - 1 && <span className="text-gray-300">→</span>}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                {pathway.certifications.length} certification{pathway.certifications.length === 1 ? "" : "s"} across{" "}
                {pathway.levels.length} learning level{pathway.levels.length === 1 ? "" : "s"}
              </p>
            </div>
          </section>
        )}

        <section id="programs" className="scroll-mt-32 border-t border-gray-100 py-6">
          <SectionEyebrow>Programs</SectionEyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Programs Under This Track</h2>

          <div className="mt-5 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setLevelFilter("")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                levelFilter === "" ? "bg-main text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              All Track
            </button>
            {pathway.levels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLevelFilter(capitalize(level))}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  levelFilter === capitalize(level) ? "bg-main text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {capitalize(level)}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visiblePrograms.length === 0 && (
              <p className="text-sm text-gray-400">No programs linked to this track yet.</p>
            )}
            {visiblePrograms.map((program) => (
              <CareerPathProgramCard key={program.id} program={program} buttonTone="blue" />
            ))}
          </div>
        </section>

        <section id="outcomes" className="scroll-mt-32 border-t border-gray-100 py-6">
          <SectionEyebrow>Outcomes</SectionEyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Career Outcomes</h2>
          <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-main">Skills Gained</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pathway.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-main">Potential Roles</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                {pathway.suitable_roles.map((role) => (
                  <li key={role}>• {role}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="testimonials" className="scroll-mt-32 border-t border-gray-100 py-6">
          <SectionEyebrow>Social Proof</SectionEyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Success Stories</h2>
          <p className="mt-5 text-sm text-gray-400">
            No success stories published for this pathway yet.
          </p>
        </section>

        <section id="faqs" className="scroll-mt-32 border-t border-gray-100 py-6">
          <SectionEyebrow>FAQs</SectionEyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <p className="mt-5 text-sm text-gray-400">
            No FAQs published for this pathway yet. See individual programs for their own FAQs.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-main px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-semibold">Ready to start your {title} journey?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
            Join professionals building recognised, practical capability through structured
            learning.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/registration"
              className="rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90"
            >
              Start Learning →
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Speak to an Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
