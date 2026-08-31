"use client";

import Link from "next/link";
import { usePrograms } from "@/hooks/queries/programs";
import { useCareerPaths } from "@/hooks/queries/career-paths";
import { ProgramCard } from "@/components/marketing/program-card";
import { CardGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { matchPathwayCategory } from "@/lib/pathways";
import Image from "next/image";

function BriefcaseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="6"
        width="15"
        height="10"
        rx="1.5"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M7 6V4.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0113 4.5V6"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5l7 3.5-7 3.5-7-3.5 7-3.5z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M3 10l7 3.5 7-3.5M3 13.5l7 3.5 7-3.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5l6 2.2v4.3c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V4.7L10 2.5z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10l1.7 1.7L13 8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5l1.4 4.1L15.5 8l-4.1 1.4L10 13.5l-1.4-4.1L4.5 8l4.1-1.4L10 2.5z"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 12.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="#f5a623"
      aria-hidden="true"
    >
      <path d="M7 1l1.8 3.7 4 .6-3 2.9.7 4-3.5-1.9-3.5 1.9.7-4-3-2.9 4-.6L7 1z" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="4" cy="16" r="1.8" stroke="white" strokeWidth="1.4" />
      <circle cx="16" cy="4" r="1.8" stroke="white" strokeWidth="1.4" />
      <path
        d="M5.5 15c3-1 3-5 5.5-6s3.5-3.5 3.5-4.5"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.4" />
      <path
        d="M3 10h14M10 3c2 2 2.8 4.5 2.8 7s-.8 5-2.8 7c-2-2-2.8-4.5-2.8-7s.8-5 2.8-7z"
        stroke="white"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function InstructorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="6.5" r="3" stroke="white" strokeWidth="1.4" />
      <path
        d="M4 17c.9-3.3 3.3-5 6-5s5.1 1.7 6 5"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AdvisorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v6a1.5 1.5 0 01-1.5 1.5H9l-3.5 3v-3H4.5A1.5 1.5 0 013 11.5v-6z"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PATHWAY_ICONS = [BriefcaseIcon, LayersIcon, ShieldIcon, SparkleIcon];

const PROCESS_STEPS = [
  "Choose a career track",
  "Review your recommended pathway",
  "Enrol in a program",
  "Earn certifications and advance",
];

const LEVELS = [
  {
    number: "01",
    label: "Foundation",
    description: "Core concepts, terminology",
  },
  {
    number: "02",
    label: "Professional",
    description: "Applied practice, certification",
  },
  {
    number: "03",
    label: "Advanced",
    description: "Leadership, advanced delivery",
  },
  {
    number: "04",
    label: "Specialised",
    description: "Strategic, niche expertise",
  },
];

const REASONS = [
  {
    title: "Structured Learning Paths",
    description:
      "Every pathway is designed with clear progression from foundation to expert.",
    icon: PathIcon,
  },
  {
    title: "Globally Recognised Certifications",
    description:
      "PMI, ISO, and industry-standard credentials accepted worldwide.",
    icon: GlobeIcon,
  },
  {
    title: "Expert Instructors",
    description:
      "Learn from practitioners with real-world experience in your chosen field.",
    icon: InstructorIcon,
  },
  {
    title: "Career Advisory Support",
    description:
      "1-on-1 advisor sessions to help you choose the right pathway.",
    icon: AdvisorIcon,
  },
];

const TESTIMONIALS = [
  {
    role: "PMP Learner",
    quote:
      "The structured pathway made it easy to know exactly what to focus on next.",
  },
  {
    role: "Front End Developer",
    quote: "Clear, practical, and paced well alongside a full-time job.",
  },
  {
    role: "UI/UX Designer",
    quote:
      "The advisor session helped me pick the right track instead of guessing.",
  },
];

const HomePage = () => {
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: pathways, isLoading: pathwaysLoading } = useCareerPaths();
  const featured = programs?.results?.slice(0, 4) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-scree items-center overflow-hidden bg-linear-to-br from-main to-deep-blue px-6 py-24 text-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              Professional Learning Platform
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Build Skills. Get Certified. Advance Your Career.
            </h1>
            <p className="mt-4 max-w-lg text-white/70">
              Structured career pathways designed to take you from beginner to
              expert. Globally recognised certifications, expert instructors,
              and personalised advisor support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/career-paths"
                className="rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90"
              >
                Explore Career Paths →
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Speak to an Advisor
              </Link>
            </div>
          </div>
          <div
            className="hidden h-95 rounded-2xl xl:h-110 lg:block"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(0,219,255,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(24,117,240,0.35), transparent 60%)",
            }}
            aria-hidden="true"
          >
            <Image
              src="/hero-page.png"
              alt="home hero image"
              width={600}
              height={440}
              className="h-full w-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Career pathways */}
      <section id="pathways" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Career Pathways
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900">
            Choose Your Career Path
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Follow a structured learning pathway designed around your experience
            level and career goals.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {pathwaysLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#E9F9FF] p-6">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="mt-4 h-5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-5/6" />
                <Skeleton className="mt-5 h-8 w-28 rounded-full bg-white" />
              </div>
            ))}
          {!pathwaysLoading && pathways?.length === 0 && (
            <p className="text-sm text-gray-400">
              No career paths published yet.
            </p>
          )}
          {pathways?.map((pathway, i) => {
            const categoryIndex = matchPathwayCategory(pathway.title);
            const Icon = PATHWAY_ICONS[categoryIndex >= 0 ? categoryIndex : i % PATHWAY_ICONS.length];

            return (
              <div key={pathway.id} className="rounded-2xl bg-[#E9F9FF] p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-main">
                  <Icon />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {pathway.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {pathway.description}
                </p>

                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Programs include
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pathway.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="rounded-xl bg-[#00AFEB12]/90 px-3 py-1 text-xs font-medium text-secondary"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/career-paths/${pathway.slug}`}
                  className="mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Path →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          The Process
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-gray-900">
          How It Works
        </h2>

        <div className="relative mt-12">
          <div
            className="absolute left-0 right-0 top-5 hidden h-px bg-gray-200 sm:block"
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-main bg-white text-sm font-semibold text-main">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured programs */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Programs
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">
              Featured Programs
            </h2>
          </div>
          <Link
            href="/programms"
            className="hidden rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:inline-flex"
          >
            View All Programs
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programsLoading && <CardGridSkeleton count={4} />}
          {!programsLoading && featured.length === 0 && (
            <p className="text-sm text-gray-400">No programs published yet.</p>
          )}
          {featured.map((program) => (
            <ProgramCard key={program.id} program={program} buttonTone="cyan" />
          ))}
        </div>
      </section>

      {/* Learning journey */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Learning Structure
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-gray-900">
          Your Learning Journey
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
          Progress from foundation to specialised expertise at your own pace.
        </p>

        <div className="mt-12 flex flex-wrap items-start justify-center gap-4">
          {LEVELS.map((level, i) => {
            const active = i === 1;
            return (
              <div key={level.label} className="flex items-center gap-4">
                <div
                  className={`relative rounded-xl border px-6 py-4 text-left ${
                    active
                      ? "border-main bg-main text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <span
                    key={level.number}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm mb-3 font-semibold ${
                      i === 1 ? "bg-white text-main" : "bg-main text-white"
                    }`}
                  >
                    {level.number}
                  </span>
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    {level.label}
                  </p>
                  <p
                    className={`mt-1 text-xs ${active ? "text-white/70" : "text-gray-400"}`}
                  >
                    {level.description}
                  </p>
                </div>
                {i < LEVELS.length - 1 && (
                  <span className="text-gray-300">›</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Why CareerCentra */}
      <section className="bg-main px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-semibold">Why CareerCentra</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Icon />
                  </div>
                  <p className="text-sm font-semibold">{reason.title}</p>
                  <p className="text-xs text-white/60">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Learner Stories
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-gray-900">
          What Our Learners Say
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.role}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20">
                  <InstructorIcon />
                </div>
                <p className="text-xs font-medium text-gray-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA: advisor */}
      <section className="mx-auto max-w-6xl px-6 pb-6">
        <div className="rounded-3xl bg-main px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-semibold">
            Not Sure Which Path Is Right For You?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
            Speak with a CareerCentra advisor and receive a personalised
            learning recommendation tailored to your career goals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/career-paths"
              className="rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90"
            >
              Explore Career Paths →
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

      {/* CTA: start learning */}
      <section className="mx-auto max-w-full mt-5">
        <div className=" bg-main px-8 py-14 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-glass">
            Get Started
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Ready to Build Your Future?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
            Choose your career path and start building recognised, practical
            capabilities.
          </p>
          <div className="mt-6">
            <Link
              href="/registration"
              className="inline-flex rounded-full bg-glass px-6 py-3 text-sm font-medium text-deep-blue hover:opacity-90"
            >
              Start Learning →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
