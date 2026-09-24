import { CheckIcon, CtaBand, InfoHero, SectionIntro } from "@/components/marketing/info-page";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const REASONS = [
  {
    title: "Globally Recognized. Locally Relevant.",
    body: "Our programs are built on the same international certification standards recognized by employers in 180+ countries. But the examples, case studies, and peer cohorts are drawn from the contexts our learners actually work in, across Africa, the UK, and the US. You get global credibility without generic content.",
  },
  {
    title: "Expert-Led. Not Algorithm-Led.",
    body: "Every CareerCentra program is delivered by a qualified, experienced facilitator — not pre-recorded modules and automated quizzes. You learn in a live cohort with peers who are at the same career moment you are. The questions you ask are answered by someone who has done this work, not by an FAQ.",
  },
  {
    title: "Credentials With Real Weight.",
    body: "The certifications you work toward on CareerCentra are not platform badges. They are globally recognized credentials issued by PMI, PECB, and Microsoft — the same certifications required by governments, multinationals, and professional services firms worldwide. CareerCentra prepares you for them. The certifying body validates you.",
  },
  {
    title: "Structured for Exam Success.",
    body: "Our programs are designed backward from the exam. Every module, practice question, and case study maps directly to the certification knowledge domain. We do not add content to seem comprehensive. We focus on what you need to pass and apply the credential you are working toward.",
  },
  {
    title: "Flexible for Working Professionals.",
    body: "Instructor-led virtual cohorts run on schedules that work around full-time roles. Self-paced options are available for professionals who need to move at their own speed. Payment installments are available across all three markets because the investment in your career should not require a single lump-sum decision.",
  },
  {
    title: "Built on 16 Years of Enterprise Expertise.",
    body: "CareerCentra is an iCentra Brand. iCentra has been building workforce capability for organizations — governments, financial institutions, energy companies — since 2009. The methodology behind every CareerCentra program is the same one that has trained over 10,000 professionals and supported transformation programs across three continents. This is not a startup figuring out how to train people.",
  },
];

const COMPARISON = [
  {
    topic: "Instruction",
    us: "Live expert facilitator",
    them: "Pre-recorded video modules",
  },
  {
    topic: "Peer Learning",
    us: "Cohort of professionals at your career stage",
    them: "No cohort — individual progress only",
  },
  {
    topic: "Accreditation Status",
    us: "PMI ATP · PECB Authorized · Microsoft Partner",
    them: "Varies — often none",
  },
  {
    topic: "Credential Authority",
    us: "PMI / PECB / Microsoft issue the credential",
    them: "Platform issues a completion badge",
  },
  {
    topic: "Exam Preparation",
    us: "Structured around the exam knowledge domain",
    them: "Generic course content",
  },
  {
    topic: "Relevance",
    us: "African and diaspora professional context built in",
    them: "Generic global / Western examples",
  },
  {
    topic: "Payment Options",
    us: "Installments available — ₦/£/$ pricing",
    them: "Full payment upfront, typically USD only",
  },
  {
    topic: "Track Record",
    us: "16+ years · 10,000+ professionals trained",
    them: "New or volume-focused",
  },
];

const WhyCareerCentraPage = () => (
  <div>
    <InfoHero
      crumb="Why CareerCentra"
      eyebrow="CareerCentra · An iCentra Brand"
      title="Why CareerCentra"
      subtitle="Six reasons career-driven professionals choose CareerCentra."
    />

    {/* Introduction */}
    <Reveal as="section" className="mx-auto max-w-4xl px-6 py-16 text-center">
      <p className="text-lg leading-relaxed text-gray-700">
        There is no shortage of places to take a training course. There is a shortage of providers
        who get the professional context right — who understand what it actually takes to pass a
        high-stakes exam, what employers recognize, and what it means to train professionals from
        Nigeria, Ghana, South Africa, the UK, and the US on a single platform that holds the same
        standard for all of them.
      </p>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-secondary">
        Here is why CareerCentra is different.
      </p>
    </Reveal>

    {/* Six reasons */}
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <RevealGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {REASONS.map((reason, i) => (
          <RevealItem
            as="article"
            key={reason.title}
            className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-main text-sm font-semibold text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{reason.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{reason.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>

    {/* Comparison */}
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          eyebrow="The difference"
          title="CareerCentra vs. Generic Online Training"
          centered
        />

        {/* Table on tablet+; stacked cards on phones so nothing scrolls sideways */}
        <Reveal className="mt-10 hidden overflow-hidden rounded-2xl border border-gray-100 bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="w-1/4 px-6 py-4 font-medium text-gray-500">What Matters</th>
                <th className="w-[40%] bg-main px-6 py-4 font-semibold text-white">CareerCentra</th>
                <th className="px-6 py-4 font-medium text-gray-400">Generic Online Course</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.topic} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.topic}</td>
                  <td className="bg-[#E9F9FF] px-6 py-4 font-medium text-deep-blue">
                    <span className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 text-main" />
                      {row.us}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <RevealGroup className="mt-10 flex flex-col gap-4 md:hidden">
          {COMPARISON.map((row) => (
            <RevealItem key={row.topic} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {row.topic}
              </p>
              <p className="mt-2 flex items-start gap-2 bg-[#E9F9FF] px-5 py-3 text-sm font-medium text-deep-blue">
                <CheckIcon className="mt-0.5 text-main" />
                {row.us}
              </p>
              <p className="px-5 py-3 text-sm text-gray-400">{row.them}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>

    <div className="pt-16">
      <CtaBand
        title="Ready?"
        description="Browse our full program catalogue and find the certification that fits your next career move."
        primary={{ label: "Browse Programs", href: "/programms" }}
        secondary={{ label: "Speak with an Advisor", href: "/contact" }}
      />
    </div>
  </div>
);

export default WhyCareerCentraPage;
