import Image from "next/image";
import { CtaBand, InfoHero, SectionIntro } from "@/components/marketing/info-page";
import { PARTNERS, type Partner } from "@/lib/partners";

const PARTNER_COPY: Record<Partner["id"], { meaning: string; issuedBy: string }> = {
  pmi: {
    meaning:
      "iCentra, the training entity behind CareerCentra, holds PMI Authorized Training Partner status — the highest-tier formal recognition PMI grants to training providers. This means our PMP, PMI-ACP, and related programs are built against PMI's Examination Content Outline (ECO), and our facilitators meet PMI's delivery standards.",
    issuedBy:
      "The PMP/CAPM/ACP credential is issued by PMI, upon passing the examination. CareerCentra issues a Certificate of Completion confirming preparation.",
  },
  pecb: {
    meaning:
      "PECB is the international certification body for ISO management system standards — information security (ISO/IEC 27001), risk management (ISO/IEC 31000), business continuity (ISO/IEC 22301), and AI management systems (ISO/IEC 42001). CareerCentra is authorized by PECB to deliver training programs aligned to their certification requirements. Professionals who complete CareerCentra's ISO-aligned programs are prepared for PECB certification examinations that are recognized by auditors, regulators, and enterprise procurement teams globally.",
    issuedBy:
      "ISO/IEC certifications are issued by PECB, upon passing the examination. CareerCentra issues a Certificate of Completion confirming preparation.",
  },
  microsoft: {
    // Tier/designation still to be confirmed with iCentra before this copy is treated as final.
    meaning:
      "Microsoft certifications are among the most sought-after technology credentials in the world — recognized by enterprises, governments, and technology firms across every market CareerCentra serves. Through the Microsoft Learning Partner program, CareerCentra delivers structured preparation for Microsoft's foundational and specialist certification tracks in cloud computing, AI, data, and productivity. Our programs are aligned to Microsoft's official certification learning paths — giving learners the structured preparation that self-study alone rarely provides.",
    issuedBy:
      "Microsoft certifications are issued by Microsoft, upon passing the examination. CareerCentra issues a Certificate of Completion confirming preparation.",
  },
};

const WHY_AUTHORIZED = [
  {
    title: "Curriculum Accuracy",
    body: "Authorized programs are built against the official examination content outline — not an interpretation of it. What you study is what the exam tests.",
  },
  {
    title: "Employer Recognition",
    body: "Employers who know what PMI ATP, PECB authorization, and Microsoft Partner status mean — and senior professionals do — treat preparation from authorized providers differently.",
  },
  {
    title: "Exam Application Support",
    body: "Authorized training partners provide the documentation employers and certifying bodies require as part of the exam application and eligibility process. CareerCentra supports you through that process, not just through the coursework.",
  },
];

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const copy = PARTNER_COPY[partner.id];
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-deep-blue px-6 py-4 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-glass">
            Partnership {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{partner.fullName}</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{partner.tag}</span>
      </header>

      <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-[1fr_220px]">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-secondary">
            What this means for you
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{copy.meaning}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-gray-50 p-5">
          <Image
            src={partner.badge.src}
            alt={partner.badge.alt}
            width={partner.badge.width}
            height={partner.badge.height}
            className="h-28 w-auto object-contain"
          />
          {partner.verifyUrl && (
            <a
              href={partner.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-secondary hover:underline"
            >
              Verify partnership →
            </a>
          )}
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-[#E9F9FF] px-6 py-4 text-sm text-deep-blue">
        <span className="font-semibold">Credential issued by {partner.name}. </span>
        {copy.issuedBy}
      </footer>
    </article>
  );
}

const PartnershipsPage = () => (
  <div>
    <InfoHero
      crumb="Partnerships"
      eyebrow="CareerCentra · An iCentra Brand"
      title="Partnerships"
      subtitle="The bodies that set the global standard. CareerCentra is authorized to prepare you for their credentials."
    />

    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-2xl border-l-4 border-main bg-gray-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Important distinction
        </p>
        <p className="mt-2 text-base leading-relaxed text-gray-800">
          CareerCentra prepares you for globally recognized credentials. The credential itself is
          issued directly by the certifying body — PMI, PECB, or Microsoft — upon passing your
          examination. CareerCentra is the authorized training partner. The certifying body is the
          authority.
        </p>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-gray-500">
        The following partnerships define the certification pathways available through
        CareerCentra. They are not marketing relationships — they are the formal authorizations
        that govern how our programs are built, what content is covered, and why the preparation you
        receive on CareerCentra is recognized as credible exam preparation by employers globally.
      </p>
    </section>

    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16">
      {PARTNERS.map((partner, i) => (
        <PartnerCard key={partner.id} partner={partner} index={i} />
      ))}
    </section>

    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          eyebrow="What this means for you"
          title="Why Authorized Matters"
          description="Any training provider can create a course about the PMP, ISO 27001, or Microsoft Azure. Not every provider is authorized by the bodies that issue those credentials. The distinction matters for three reasons."
          centered
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {WHY_AUTHORIZED.map((item, i) => {
            const active = i === 1;
            return (
              <div
                key={item.title}
                className={`rounded-2xl border p-6 ${
                  active ? "border-main bg-main text-white" : "border-gray-100 bg-white text-gray-700"
                }`}
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${active ? "text-white/75" : "text-gray-500"}`}>
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <div className="pt-16">
      <CtaBand
        title="Find Your Certification"
        description="Browse programs by discipline and certification track. Every program on CareerCentra is backed by formal authorization from the body that issues the credential you are working toward."
        primary={{ label: "Browse Programs", href: "/programms" }}
        secondary={{ label: "Have a Question?", href: "/contact" }}
      />
    </div>
  </div>
);

export default PartnershipsPage;
