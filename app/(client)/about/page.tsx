import Image from "next/image";
import Link from "next/link";
import { CheckIcon, CtaBand, InfoHero, SectionIntro } from "@/components/marketing/info-page";
import { PARTNERS } from "@/lib/partners";

const STATS = [
  { value: "16+", label: "Years of Learning & Transformation Experience" },
  { value: "10,000+", label: "Professionals Trained" },
  { value: "3", label: "Continents — Africa, Europe & North America" },
];

const STEPS = [
  {
    title: "Enroll in Your Program",
    body: "Choose from instructor-led virtual cohorts or self-paced learning. Browse programs by discipline — project management, cybersecurity, AI, agile, or digital business.",
  },
  {
    title: "Train With Expert Facilitators",
    body: "Complete a structured, exam-focused program built around the certifying body's knowledge domain. Real instruction, peer learning, and practical application, not just slides.",
  },
  {
    title: "Receive Your CareerCentra Certificate of Completion",
    body: "On completing the program, you receive a CareerCentra Certificate of Completion — issued by iCentra, a PMI/PECB Authorized Training Partner, confirming you have completed the full preparation.",
  },
  {
    title: "Sit Your Exam With the Certifying Body",
    body: "Your exam is administered independently by PMI, PECB, Microsoft, or the relevant credentialing body. CareerCentra supports your exam application and preparation.",
  },
  {
    title: "Earn Your Globally Recognized Credential",
    body: "Upon passing, your credential is issued directly by the certifying body. Your PMI, PECB or Microsoft certification is valid worldwide and belongs entirely to you.",
  },
];

function TrendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 14l5-5 3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 5h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 7h11M12 4l3 3-3 3M16 13H5M8 10l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5l7 3.5-7 3.5-7-3.5 7-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 10l7 3.5 7-3.5M3 13.5l7 3.5 7-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const AUDIENCES = [
  {
    title: "Career Climbers",
    body: "3–8 years in your field and ready for your first major globally recognized credential. The PMI, PECB or Microsoft certification that signals you are serious.",
    icon: TrendIcon,
  },
  {
    title: "Career Switchers",
    body: "Moving into project management, technology, cybersecurity, or compliance. CareerCentra gives you the structured credential that makes that transition credible, fast.",
    icon: SwitchIcon,
  },
  {
    title: "Credential Builders",
    body: "Already certified and building a portfolio of qualifications that compound. Advanced certifications for professionals who understand that credentials stack.",
    icon: StackIcon,
  },
];

const ICENTRA_POINTS = [
  {
    title: "PMI Authorized Training Partner",
    body: "iCentra holds PMI “Premier” ATP status, the gold standard for PMI certification exam preparation globally.",
  },
  {
    title: "PECB Authorized Partner",
    body: "iCentra is authorized to deliver training for PECB's full suite of ISO management system certifications.",
  },
  {
    title: "Microsoft Partner",
    body: "Authorized to deliver training aligned to Microsoft certification pathways.",
  },
  {
    title: "16+ Years of Delivery",
    body: "Not a new brand learning how to train people. A proven methodology developed through thousands of professionals trained across Africa, the UK, and the US.",
  },
];

const AboutPage = () => (
  <div>
    <InfoHero
      crumb="About"
      eyebrow="CareerCentra · An iCentra Brand"
      title="About CareerCentra"
      subtitle="The career advancement platform for professionals who want structured programs and a clear path to globally recognized credentials."
    >
      <figure className="rounded-2xl border border-white/15 bg-white/10 p-7">
        <span className="text-4xl leading-none text-glass" aria-hidden="true">
          &ldquo;
        </span>
        <blockquote className="mt-2 text-lg font-medium leading-relaxed">
          We built CareerCentra for one reason: globally recognized credentials should be within
          reach of every professional who is ready to earn them, regardless of where they are
          starting from.
        </blockquote>
      </figure>
    </InfoHero>

    {/* What is CareerCentra */}
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <SectionIntro
          eyebrow="What is CareerCentra"
          title="Built for Career Advancement. Backed by 16 Years of Expertise."
        />
        <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-gray-600">
          <p>
            CareerCentra is the career advancement platform for professionals who want structured
            programs and a clear path to globally recognized credentials. We support professionals
            across project management, cybersecurity, AI, agile, and digital business — from
            foundational courses and iCentra certificates through to globally recognized credentials
            issued by PMI, PECB, and Microsoft.
          </p>
          <p>
            CareerCentra is an iCentra Brand. iCentra is a global technology and business company
            with over 16 years of enterprise transformation experience across Africa, Europe, and
            North America. Every program on CareerCentra is built on iCentra&apos;s proven delivery
            methodology and backed by iCentra&apos;s status as a PMI and PECB Authorized Training
            Partner.
          </p>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Important distinction
        </p>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          We are the training partner — not the credential issuer.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Our programs are structured, practical, and exam-focused. The certifications you earn are
          issued by PMI, PECB, Microsoft, and other globally recognized bodies after you pass your
          examination. Your credential belongs to you, validated by the same organizations that set
          the global standard.
        </p>
        <div className="mt-5 flex items-center gap-5 border-t border-gray-200 pt-5">
          {PARTNERS.map((partner) => (
            <Image
              key={partner.id}
              src={partner.badge.src}
              alt={partner.badge.alt}
              width={partner.badge.width}
              height={partner.badge.height}
              className="h-14 w-auto object-contain"
            />
          ))}
        </div>
      </aside>
    </section>

    {/* Proof points */}
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.value}
            className={`flex flex-col items-center justify-center px-6 py-8 text-center ${
              i % 2 === 0 ? "bg-main text-white" : "bg-[#E9F9FF] text-gray-700"
            }`}
          >
            <p className={`text-4xl font-bold ${i % 2 === 0 ? "text-glass" : "text-main"}`}>
              {stat.value}
            </p>
            <p className="mt-2 max-w-[14rem] text-sm">{stat.label}</p>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center bg-[#E9F9FF] px-6 py-8 text-center text-gray-700">
          <div className="flex items-center gap-3">
            {PARTNERS.map((partner) => (
              <Image
                key={partner.id}
                src={partner.badge.src}
                alt={partner.badge.alt}
                width={partner.badge.width}
                height={partner.badge.height}
                className="h-10 w-auto object-contain"
              />
            ))}
          </div>
          <p className="mt-3 text-sm">PMI · PECB · Microsoft Authorized Training Partner</p>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <SectionIntro
          eyebrow="How it works"
          title="How CareerCentra Works"
          description="The path from enrollment to globally recognized credential is straightforward. CareerCentra handles the preparation. The credentialing body handles the certification."
          centered
        />
        <ol className="mt-10 flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
              {i < STEPS.length - 1 && (
                <span
                  className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-px bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-main text-sm font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* Who it's for */}
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionIntro
        eyebrow="Who CareerCentra is for"
        title="Built for Professionals Who Are Ready to Move"
        description="CareerCentra is designed for working professionals who want to grow. Not for beginners still deciding whether to start — for people who have decided, and need a structured, credible path to get there."
      />
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {AUDIENCES.map((audience, i) => {
          const active = i === 1;
          const Icon = audience.icon;
          return (
            <div
              key={audience.title}
              className={`rounded-2xl border p-6 ${
                active ? "border-main bg-main text-white" : "border-gray-100 bg-white text-gray-700"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  active ? "bg-white text-main" : "bg-main text-white"
                }`}
              >
                <Icon />
              </span>
              <h3 className="mt-4 text-base font-semibold">{audience.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${active ? "text-white/75" : "text-gray-500"}`}>
                {audience.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>

    {/* Backed by iCentra */}
    <section className="bg-deep-blue px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-glass">Backed by iCentra</p>
        <h2 className="mt-2 text-3xl font-semibold">The iCentra Difference</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
          CareerCentra is not a startup training platform. It is the individual-facing brand of
          iCentra, a global technology and business company founded in 2009, with a documented
          track record of training and transforming organizations across Africa and
          internationally.
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ICENTRA_POINTS.map((point) => (
            <li key={point.title} className="flex gap-4 rounded-2xl bg-white/10 p-5">
              <CheckIcon className="mt-0.5 text-glass" />
              <div>
                <h3 className="text-sm font-semibold">{point.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/partnerships"
          className="mt-8 inline-flex text-sm font-medium text-glass hover:underline"
        >
          See our partnerships →
        </Link>
      </div>
    </section>

    <div className="pt-16">
      <CtaBand
        title="Ready to Start?"
        description="Browse our programs and find the certification that fits where you are going — not just where you are."
        primary={{ label: "Browse Programs", href: "/programms" }}
        secondary={{ label: "Speak with an Advisor", href: "/contact" }}
      />
    </div>
  </div>
);

export default AboutPage;
