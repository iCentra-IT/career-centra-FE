import Link from "next/link";
import type { Metadata } from "next";
import { InfoHero } from "@/components/marketing/info-page";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CareerCentra collects, uses, and protects your personal data under the NDPA 2023.",
  alternates: { canonical: "/privacy" },
};

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" id={id} className="scroll-mt-28 border-b border-gray-100 py-10 first:pt-0 last:border-0">
      <h2 className="text-xl font-semibold text-gray-900">
        <span className="text-secondary">{number}.</span> {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-gray-600">{children}</div>
    </Reveal>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm font-semibold text-gray-900">{children}</p>;
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-secondary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const TOC = [
  { id: "controller", label: "1. Data Controller & Contact" },
  { id: "data-collected", label: "2. Data We Collect" },
  { id: "legal-basis", label: "3. Legal Basis for Processing" },
  { id: "how-we-use", label: "4. How We Use Your Data" },
  { id: "retention", label: "5. How Long We Keep Data" },
  { id: "protection", label: "6. How We Protect Your Data" },
  { id: "sharing", label: "7. Who We Share Data With" },
  { id: "rights", label: "8. Your Rights" },
  { id: "cookies", label: "9. Cookies & Online Tracking" },
  { id: "children", label: "10. Children & Young Learners" },
  { id: "transfers", label: "11. International Data Transfers" },
  { id: "third-party", label: "12. Third-Party Links & Services" },
  { id: "dpo", label: "13. Data Protection Officer" },
  { id: "changes", label: "14. Changes to This Policy" },
];

export default function PrivacyPage() {
  return (
    <div>
      <InfoHero
        crumb="Privacy Policy"
        eyebrow="Legal"
        title="Privacy Policy & Data Protection Statement"
        subtitle="Effective Date: September 21, 2026 · Last Updated: September 21, 2026"
      />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <Reveal className="max-w-3xl text-sm leading-relaxed text-gray-600">
          <p>
            CareerCentra (a division of iCentra Solutions Limited) is committed to protecting your
            privacy and ensuring you have a positive experience on our website and when using our
            services. This Privacy Policy explains how we collect, use, disclose, and safeguard
            your personal data in compliance with the Nigerian Data Protection Act (NDPA) 2023 and
            other applicable laws.
          </p>
          <p className="mt-4">
            Please read this policy carefully. If you do not agree with our practices, please do
            not use our services. By registering for an account, submitting forms, or interacting
            with our website, you acknowledge that you have read and understood this Privacy
            Policy and consent to the collection and processing of your personal data as described
            herein.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          {/* Table of contents — sticky on desktop so a long legal doc stays navigable. */}
          <nav className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-1 border-l border-gray-100 pl-4 text-sm">
              {TOC.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="py-1 text-gray-500 hover:text-main">
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="min-w-0">
            <Section id="controller" number="1" title="Data Controller and Contact Information">
              <p>
                CareerCentra is owned and operated by iCentra Solutions Limited (the &quot;Data
                Controller&quot;). We are responsible for determining the purposes and means of
                processing your personal data.
              </p>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <SubHeading>Data Controller Details</SubHeading>
                <List
                  items={[
                    "Entity: iCentra Solutions Limited",
                    "Trading Name: CareerCentra",
                    "Address: Abuja, Nigeria",
                    <>
                      Email:{" "}
                      <a href="mailto:privacy@careercentra.icentra.com" className="text-secondary hover:underline">
                        privacy@careercentra.icentra.com
                      </a>
                    </>,
                    "Phone: +234 (0) 8076757797",
                  ]}
                />
              </div>
              <p>
                For inquiries about your personal data or to exercise your data subject rights,
                please contact our Data Protection Officer at the above email address.
              </p>
            </Section>

            <Section id="data-collected" number="2" title="Types of Personal Data We Collect">
              <p>
                We collect personal data through several methods to provide you with the best
                possible learning experience and services. The types of data we collect include:
              </p>

              <SubHeading>A. Data Collected Through Registration</SubHeading>
              <p>When you create a CareerCentra account, we collect:</p>
              <List
                items={[
                  "First Name and Last Name",
                  "Email Address",
                  "Phone Number",
                  "Location (Country/State)",
                  "Password (securely hashed, never stored in plain text)",
                  "Account creation date and login history",
                ]}
              />

              <SubHeading>B. Data Collected Through Facilitator Applications</SubHeading>
              <p>If you apply to become a CareerCentra facilitator, we collect:</p>
              <List
                items={[
                  "Full Name",
                  "Email Address",
                  "Phone Number",
                  "LinkedIn URL and profile information",
                  "Years of Professional Experience",
                  "Specialised Domains and Areas of Expertise",
                  "Active Professional Credentials and Certifications",
                  "Motivation Statement (your reasons for joining as a facilitator)",
                  "Resume and Cover Letter (uploaded as PDF or Word documents)",
                  "Educational background and professional qualifications",
                ]}
              />

              <SubHeading>C. Data Collected Through Contact and Consultation Services</SubHeading>
              <p>When you book a consultation or contact us through our website:</p>
              <List
                items={[
                  "Name and Email Address (from Calendly booking integration)",
                  "Phone Number and Messages (through WhatsApp)",
                  "Date and Time of Consultation",
                  "Topic or Subject Matter of Inquiry",
                  "Any additional information you voluntarily provide",
                ]}
              />

              <SubHeading>D. Technical and Website Usage Data</SubHeading>
              <p>We automatically collect information about your interaction with our website:</p>
              <List
                items={[
                  "IP Address and Device Information (operating system, browser type, device model)",
                  "Pages Visited and Time Spent on Each Page",
                  "Links Clicked and Navigation Patterns",
                  "Referral Source (how you arrived at our website)",
                  "Cookies and Similar Tracking Technologies",
                  "Approximate Geolocation (country/city level, not precise)",
                ]}
              />

              <SubHeading>E. Payment and Transaction Data</SubHeading>
              <p>If you make purchases on CareerCentra:</p>
              <List
                items={[
                  "Payment Method Information (processed securely; we do not store full card details)",
                  "Transaction Amount and Date",
                  "Invoice and Order History",
                  "Billing Address and Currency Preference",
                ]}
              />

              <SubHeading>F. Learning and Course Enrollment Data</SubHeading>
              <p>When you enrol in programs and courses:</p>
              <List
                items={[
                  "Program and Course Selections",
                  "Enrollment Date and Completion Status",
                  "Learning Progress and Quiz/Assessment Scores",
                  "Certification Details and Achievement Badges",
                  "Feedback and Course Reviews",
                ]}
              />
            </Section>

            <Section id="legal-basis" number="3" title="Legal Basis for Processing Your Personal Data">
              <p>
                Under the Nigerian Data Protection Act (NDPA) 2023, we only process your personal
                data when we have a lawful basis to do so. The legal bases for our processing
                include:
              </p>
              <List
                items={[
                  <>
                    <strong className="text-gray-900">Consent:</strong> You have given us explicit,
                    informed consent to process your data (e.g., upon registration and through
                    consent checkboxes).
                  </>,
                  <>
                    <strong className="text-gray-900">Contractual Necessity:</strong> Processing is
                    necessary to perform our services to you, such as course enrollment, payment
                    processing, and facilitator management.
                  </>,
                  <>
                    <strong className="text-gray-900">Legal Obligation:</strong> We process data to
                    comply with applicable laws, regulations, and regulatory requirements.
                  </>,
                  <>
                    <strong className="text-gray-900">Legitimate Interest:</strong> We process data
                    for purposes such as improving our services, preventing fraud, conducting
                    analytics, and ensuring platform security.
                  </>,
                ]}
              />
            </Section>

            <Section id="how-we-use" number="4" title="How We Use Your Personal Data">
              <p>We use your personal data for the following purposes:</p>

              <SubHeading>Service Delivery and Account Management</SubHeading>
              <List
                items={[
                  "Creating and managing your CareerCentra account",
                  "Processing course enrollments and registrations",
                  "Providing learning materials, assessments, and certifications",
                  "Managing facilitator applications and onboarding",
                  "Processing payments and generating invoices",
                  "Communicating about your account status and course progress",
                ]}
              />

              <SubHeading>Communication and Support</SubHeading>
              <List
                items={[
                  "Responding to your inquiries and providing customer support",
                  "Sending training materials, updates, and course reminders",
                  "Notifying you of program changes, new courses, or special offers",
                  "Scheduling and confirming consultation sessions",
                ]}
              />

              <SubHeading>Platform Improvement and Analytics</SubHeading>
              <List
                items={[
                  "Analyzing usage patterns to improve our website and services",
                  "Conducting surveys and gathering feedback",
                  "Generating anonymized, aggregated reports on learning trends",
                  "Personalizing your learning experience and recommendations",
                ]}
              />

              <SubHeading>Compliance and Security</SubHeading>
              <List
                items={[
                  "Detecting and preventing fraud, abuse, and security breaches",
                  "Enforcing our Terms of Use and other agreements",
                  "Maintaining records required by law",
                  "Investigating complaints and resolving disputes",
                ]}
              />

              <SubHeading>Marketing and Business Development</SubHeading>
              <List
                items={[
                  "Sending marketing communications about new programs or partnerships (only with your consent)",
                  "Conducting market research and identifying business opportunities",
                  "Promoting CareerCentra services to prospective learners or facilitators",
                ]}
              />
            </Section>

            <Section id="retention" number="5" title="How Long We Keep Your Data">
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes
                for which it was collected, or as required by law:
              </p>
              <List
                items={[
                  <>
                    <strong className="text-gray-900">Account Data:</strong> Retained for the
                    duration of your account and for 3 years after account closure, unless required
                    longer for legal reasons.
                  </>,
                  <>
                    <strong className="text-gray-900">Payment and Transaction Data:</strong>{" "}
                    Retained for 7 years to comply with tax and accounting regulations.
                  </>,
                  <>
                    <strong className="text-gray-900">Facilitator Application Data:</strong>{" "}
                    Retained for 2 years if you are not selected, or indefinitely if you become an
                    active facilitator.
                  </>,
                  <>
                    <strong className="text-gray-900">Communication Records:</strong> Retained for 2
                    years unless the communication relates to a dispute or legal matter.
                  </>,
                  <>
                    <strong className="text-gray-900">Website Analytics and Technical Data:</strong>{" "}
                    Typically retained for 12 months. Cookies are deleted based on settings (see
                    Section 9).
                  </>,
                  <>
                    <strong className="text-gray-900">Learning Progress and Assessment Data:</strong>{" "}
                    Retained for the duration of your certification validity and as required by
                    partner accreditation bodies.
                  </>,
                ]}
              />
              <p>
                Upon expiration of these retention periods, your personal data will be securely
                deleted or anonymized, except where retention is required by law or for legitimate
                business purposes.
              </p>
            </Section>

            <Section id="protection" number="6" title="How We Protect Your Data">
              <p>
                We implement comprehensive technical and organizational measures to protect your
                personal data from unauthorized access, alteration, disclosure, and destruction:
              </p>

              <SubHeading>Technical Security Measures</SubHeading>
              <List
                items={[
                  <>
                    <strong className="text-gray-900">SSL/TLS Encryption:</strong> All data
                    transmitted between your device and our servers is encrypted using
                    industry-standard SSL/TLS protocols.
                  </>,
                  <>
                    <strong className="text-gray-900">Password Security:</strong> Passwords are
                    hashed using strong cryptographic algorithms and never stored in plain text.
                  </>,
                  <>
                    <strong className="text-gray-900">Access Controls:</strong> Role-based access
                    controls limit employee access to personal data to only those who need it.
                  </>,
                  <>
                    <strong className="text-gray-900">Firewalls and Intrusion Detection:</strong>{" "}
                    Our systems are protected by firewalls and continuous monitoring for security
                    threats.
                  </>,
                  <>
                    <strong className="text-gray-900">Regular Security Audits:</strong> We conduct
                    periodic security assessments and penetration testing.
                  </>,
                ]}
              />

              <SubHeading>Organizational Security Measures</SubHeading>
              <List
                items={[
                  <>
                    <strong className="text-gray-900">Staff Training:</strong> All employees
                    handling personal data receive data protection and confidentiality training.
                  </>,
                  <>
                    <strong className="text-gray-900">Confidentiality Agreements:</strong> Employees
                    and contractors sign confidentiality agreements binding them to protect your
                    data.
                  </>,
                  <>
                    <strong className="text-gray-900">Incident Response Plan:</strong> We maintain
                    documented procedures for responding to data breaches.
                  </>,
                  <>
                    <strong className="text-gray-900">Data Breach Notification:</strong> In the
                    event of a data breach, we will notify affected individuals and the Nigeria
                    Data Protection Commission (NDPC) as required by law.
                  </>,
                ]}
              />
              <p className="rounded-xl bg-amber-50 p-4 text-amber-800">
                <strong>Note:</strong> While we take every precaution, no method of transmission
                over the internet or electronic storage is completely secure. We cannot guarantee
                absolute security of your data.
              </p>
            </Section>

            <Section id="sharing" number="7" title="Who We Share Your Data With">
              <p>We may share your personal data with third parties only in the following circumstances:</p>

              <SubHeading>Service Providers and Processors</SubHeading>
              <List
                items={[
                  "Email and Communication Platforms: To send you course updates and support messages.",
                  "Payment Processors: To securely process your payments (they never receive full card details).",
                  "Calendly: For booking and scheduling consultation sessions.",
                  "WhatsApp Business API: For direct messaging and customer support.",
                  "Analytics Providers: For website usage analytics and performance improvement.",
                  "Cloud Hosting Providers: For secure storage and backup of your data.",
                ]}
              />
              <p>
                All service providers are contractually bound to protect your data and use it only
                for the purposes specified.
              </p>

              <SubHeading>Accreditation and Certification Bodies</SubHeading>
              <List
                items={[
                  "PMI (Project Management Institute): If you enroll in PMI-approved programs.",
                  "PECB and ISO: For certification verification and credential management.",
                  "Microsoft and other partners: To verify your completion of partner-specific programs.",
                ]}
              />

              <SubHeading>Corporate and Enterprise Clients</SubHeading>
              <List
                items={[
                  "For organizational learning and training, we may share aggregated progress data with your employer (only with your consent and limited to necessary information).",
                  "We do not share individual assessment scores or personal details without explicit authorization.",
                ]}
              />

              <SubHeading>Legal and Compliance Requirements</SubHeading>
              <List
                items={[
                  "Law Enforcement: If required by law, court order, or government agency request.",
                  "Regulatory Bodies: To comply with the NDPA 2023 and other applicable regulations.",
                  "Business Transfers: If CareerCentra is acquired or merged, your data may be transferred as part of that transaction (with notification to you).",
                ]}
              />
              <p>
                We do not sell your personal data to third parties for marketing purposes. Any data
                sharing is done only with your knowledge and consent, or as required by law.
              </p>
            </Section>

            <Section id="rights" number="8" title="Your Rights as a Data Subject">
              <p>Under the Nigerian Data Protection Act (NDPA) 2023, you have the following rights:</p>

              <SubHeading>Right to Access</SubHeading>
              <p>
                You have the right to request and obtain a copy of your personal data that we
                hold. You can request this by contacting{" "}
                <a href="mailto:privacy@careercentra.icentra.com" className="text-secondary hover:underline">
                  privacy@careercentra.icentra.com
                </a>
                .
              </p>

              <SubHeading>Right to Rectification</SubHeading>
              <p>
                If your personal data is inaccurate or incomplete, you have the right to request
                correction. You can update most of your information directly in your account
                settings.
              </p>

              <SubHeading>Right to Erasure (Right to be Forgotten)</SubHeading>
              <p>
                You may request deletion of your personal data in certain circumstances, such as
                when the data is no longer necessary for the purposes for which it was collected,
                or if you withdraw your consent. Note: We may retain some data for legal
                compliance.
              </p>

              <SubHeading>Right to Data Portability</SubHeading>
              <p>
                You have the right to receive your personal data in a structured, commonly used,
                and machine-readable format, and to transmit that data to another data controller.
              </p>

              <SubHeading>Right to Object</SubHeading>
              <p>
                You have the right to object to the processing of your personal data for marketing
                purposes. You can unsubscribe from marketing emails at any time using the
                &quot;Unsubscribe&quot; link.
              </p>

              <SubHeading>Right to Restrict Processing</SubHeading>
              <p>
                You may request that we limit how we use your personal data while we verify its
                accuracy or resolve a dispute.
              </p>

              <SubHeading>Right to Withdraw Consent</SubHeading>
              <p>
                If we process your data based on your consent, you have the right to withdraw that
                consent at any time. This will not affect the lawfulness of processing before
                withdrawal.
              </p>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <SubHeading>How to Exercise Your Rights</SubHeading>
                <p className="mt-2">To exercise any of these rights, please submit a written request to:</p>
                <p className="mt-1 font-medium text-gray-900">
                  <a href="mailto:privacy@careercentra.icentra.com" className="text-secondary hover:underline">
                    privacy@careercentra.icentra.com
                  </a>
                </p>
                <p className="mt-2">
                  Please include your name, email address, and a clear description of your
                  request. We will respond within 30 days or as required by law. If we are unable
                  to fulfill your request, we will explain the reasons.
                </p>
              </div>
            </Section>

            <Section id="cookies" number="9" title="Cookies and Online Tracking">
              <p>
                We use cookies and similar tracking technologies to enhance your user experience
                and improve our website:
              </p>

              <SubHeading>Types of Cookies We Use</SubHeading>
              <List
                items={[
                  <>
                    <strong className="text-gray-900">Essential Cookies:</strong> Required for
                    website functionality (e.g., authentication, security).
                  </>,
                  <>
                    <strong className="text-gray-900">Preference Cookies:</strong> Remember your
                    preferences and settings (e.g., language, theme).
                  </>,
                  <>
                    <strong className="text-gray-900">Analytics Cookies:</strong> Track usage
                    patterns to improve our services.
                  </>,
                  <>
                    <strong className="text-gray-900">Marketing Cookies:</strong> Used to show
                    relevant ads and measure marketing effectiveness (only with consent).
                  </>,
                ]}
              />

              <SubHeading>Managing Cookies</SubHeading>
              <p>You can control cookie settings through your browser preferences. Most browsers allow you to:</p>
              <List items={["Accept or reject cookies", "Delete existing cookies", "Receive alerts when cookies are being set"]} />
              <p>Please note that disabling certain cookies may affect the functionality of our website.</p>

              <SubHeading>Third-Party Analytics</SubHeading>
              <p>
                We use third-party analytics services (e.g., Google Analytics) to understand how
                visitors use our site. These services may set their own cookies. You can opt out of
                Google Analytics tracking by visiting{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline"
                >
                  tools.google.com/dlpage/gaoptout
                </a>
                .
              </p>
            </Section>

            <Section id="children" number="10" title="Children and Young Learners">
              <p>
                CareerCentra is designed for learners aged 18 and above. We do not knowingly
                collect personal data from children under 18 without parental consent.
              </p>
              <p>
                If you are under 18, you must obtain parental or guardian consent before
                registering for an account or using our services. If we discover that we have
                collected data from a child without consent, we will delete that information
                promptly.
              </p>
              <p>
                Parents or guardians who believe their child has provided personal information to
                CareerCentra should contact us immediately at{" "}
                <a href="mailto:privacy@careercentra.icentra.com" className="text-secondary hover:underline">
                  privacy@careercentra.icentra.com
                </a>
                .
              </p>
            </Section>

            <Section id="transfers" number="11" title="International Data Transfers">
              <p>
                CareerCentra operates globally and may transfer your personal data to countries
                outside Nigeria. We ensure that any such transfers comply with the NDPA 2023
                through:
              </p>
              <List
                items={[
                  "Contractual safeguards with international partners",
                  "Implementing appropriate security measures",
                  "Ensuring recipient countries have adequate data protection",
                ]}
              />
              <p>By using CareerCentra, you consent to the transfer of your data as described in this policy.</p>
            </Section>

            <Section id="third-party" number="12" title="Third-Party Links and Services">
              <p>
                Our website may contain links to third-party websites and services (e.g., Calendly,
                WhatsApp, partner certification bodies). We are not responsible for the privacy
                practices of these third parties.
              </p>
              <p>
                We recommend reviewing the privacy policies of any third-party services before
                providing your information. Your use of third-party services is governed by their
                privacy policies, not this document.
              </p>
            </Section>

            <Section id="dpo" number="13" title="Data Protection Officer and Complaints">
              <p>
                iCentra Solutions Limited has appointed a Data Protection Officer (DPO) to oversee
                compliance with the NDPA 2023.
              </p>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <SubHeading>To Contact Our DPO or Privacy Team</SubHeading>
                <List
                  items={[
                    <>
                      Email:{" "}
                      <a href="mailto:privacy@careercentra.icentra.com" className="text-secondary hover:underline">
                        privacy@careercentra.icentra.com
                      </a>
                    </>,
                    "Phone: +234 (0) 8076757797",
                    "Address: iCentra Solutions Limited, Abuja, Nigeria",
                  ]}
                />
              </div>

              <SubHeading>Filing a Complaint</SubHeading>
              <p>
                If you believe your personal data has been processed in violation of the NDPA
                2023, you have the right to file a complaint with:
              </p>
              <List
                items={[
                  "Our Data Protection Officer (above contact details)",
                  <>
                    The Nigeria Data Protection Commission (NDPC) at{" "}
                    <a
                      href="https://www.ndpc.gov.ng"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      www.ndpc.gov.ng
                    </a>
                  </>,
                ]}
              />
            </Section>

            <Section id="changes" number="14" title="Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                practices or applicable law. Any material changes will be communicated to you via
                email or a prominent notice on our website.
              </p>
              <p>
                Your continued use of CareerCentra after such updates constitutes your acceptance
                of the revised Privacy Policy. Please review this policy periodically to stay
                informed about how we protect your data.
              </p>
              <p className="text-xs text-gray-400">
                Version: 1.0 · Effective Date: September 21, 2026 · Next Annual Review: September
                21, 2027
              </p>
            </Section>

            <Reveal className="mt-10 rounded-2xl bg-main p-6 text-white">
              <h2 className="text-lg font-semibold">Data Processing Consent</h2>
              <p className="mt-2 text-sm text-white/70">By registering for CareerCentra services, you confirm that you:</p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/80">
                {[
                  "Have read and understood this Privacy Policy",
                  "Consent to the collection, use, and processing of your personal data as described herein",
                  "Understand your data subject rights and how to exercise them",
                  "Agree that your data may be shared with service providers and accreditation bodies as necessary",
                  "Consent to receive communications about your account and course progress",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-glass" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/70">
                Thank you for entrusting CareerCentra with your personal information. Questions?{" "}
                <Link href="/contact" className="font-medium text-glass hover:underline">
                  Get in touch
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
