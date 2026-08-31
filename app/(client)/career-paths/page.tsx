"use client";

import Link from "next/link";
import { useCareerPaths, useCareerPathPrograms } from "@/hooks/queries/career-paths";
import { RowCardSkeleton } from "@/components/ui/skeleton";
import { matchPathwayCategory } from "@/lib/pathways";
import type { CareerPath } from "@/types/career-paths";

function BriefcaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="15" height="10" rx="1.5" stroke="white" strokeWidth="1.5" />
      <path d="M7 6V4.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0113 4.5V6" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5l7 3.5-7 3.5-7-3.5 7-3.5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 10l7 3.5 7-3.5M3 13.5l7 3.5 7-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5l6 2.2v4.3c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V4.7L10 2.5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 10l1.7 1.7L13 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.8" stroke="white" strokeWidth="1.5" />
      <path
        d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.9 5.1l-1.1 1.1M6.2 13.7l-1.1 1.1M14.9 14.9l-1.1-1.1M6.2 6.2L5.1 5.1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS = [BriefcaseIcon, LayersIcon, ShieldIcon, CogIcon];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function PathwayCard({ pathway, icon: Icon }: { pathway: CareerPath; icon: () => React.JSX.Element }) {
  const { data: linkedPrograms } = useCareerPathPrograms(pathway.slug);

  return (
    <div className="rounded-2xl border border-gray-100 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-main">
            <Icon />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-main">{pathway.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-gray-500">{pathway.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-40">
          <Link
            href={`/career-paths/${pathway.slug}`}
            className="rounded-md bg-main px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-deep-blue"
          >
            Explore Path
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Speak to Advisor
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Suitable Roles
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600">
            {pathway.suitable_roles.map((role) => (
              <li key={role}>• {role}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Pathway Levels
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {pathway.levels.map((level) => (
              <span
                key={level}
                className="rounded-md bg-secondary/80 px-3 py-1 text-center text-xs font-medium text-white"
              >
                {capitalize(level)}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Certifications
          </p>
          <p className="mt-2 text-sm text-gray-600">{pathway.certifications.join(", ")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Skills You&apos;ll Gain
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pathway.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <p>
          Programs:{" "}
          <span className="font-semibold text-gray-900">
            {linkedPrograms ? linkedPrograms.length : "…"}
          </span>
        </p>
        <p>
          Suitable roles:{" "}
          <span className="font-semibold text-gray-900">{pathway.suitable_roles.length}</span>
        </p>
        <p>
          Learning levels: <span className="font-semibold text-gray-900">{pathway.levels.length}</span>
        </p>
      </div>
    </div>
  );
}

const CareerPathsPage = () => {
  const { data: pathways, isLoading } = useCareerPaths();

  return (
    <div>
      <section className="bg-gradient-to-br from-main to-deep-blue px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            › Career Paths
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Explore Career Paths</h1>
          <p className="mt-3 max-w-xl text-white/70">
            Choose a structured pathway based on your goals, experience, and desired career
            outcome.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-6">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <RowCardSkeleton key={i} />)}
          {!isLoading && pathways?.length === 0 && (
            <p className="text-sm text-gray-400">No career paths published yet.</p>
          )}
          {pathways?.map((pathway, i) => {
            const categoryIndex = matchPathwayCategory(pathway.title);
            const icon = ICONS[categoryIndex >= 0 ? categoryIndex : i % ICONS.length];
            return <PathwayCard key={pathway.id} pathway={pathway} icon={icon} />;
          })}
        </div>
      </section>
    </div>
  );
};

export default CareerPathsPage;
