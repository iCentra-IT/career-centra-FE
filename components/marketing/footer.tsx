import Image from "next/image";
import Link from "next/link";
import { PATHWAY_CATEGORIES } from "@/lib/pathways";

const PROGRAM_LINKS = [
  { label: "Project Management", href: `/programms?track=${encodeURIComponent(PATHWAY_CATEGORIES[0].programType)}` },
  { label: "Agile & Product", href: `/programms?track=${encodeURIComponent(PATHWAY_CATEGORIES[1].programType)}` },
  { label: "Cybersecurity & Risk", href: `/programms?track=${encodeURIComponent(PATHWAY_CATEGORIES[2].programType)}` },
  { label: "AI & Digital Transformation", href: `/programms?track=${encodeURIComponent(PATHWAY_CATEGORIES[3].programType)}` },
  { label: "Executive Programs", href: "/programms" },
];

// No dedicated solutions pages exist yet — these route to Contact rather than a dead link.
const SOLUTION_LINKS = [
  { label: "Workforce Capability Partnerships™", href: "/contact" },
  { label: "Corporate Training", href: "/contact" },
  { label: "Enterprise Certification", href: "/contact" },
  { label: "Leadership Development", href: "/contact" },
  { label: "Terms and Conditions", href: "/terms" },
];

const COMPANY_LINKS = [
  { label: "About CareerCentra", href: "/about" },
  { label: "Why CareerCentra", href: "/why-careercentra" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Become a Facilitator", href: "/facilitator" },
];

const LEGAL_LINKS = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

function Logo() {
  // The logo asset's navy/cyan wordmark reads poorly on this footer's dark bg-deep-blue, and
  // there's no dedicated light/white variant in the public folder — brightness-0 + invert renders
  // it as a clean white silhouette instead (a standard technique for placing a colored logo on a
  // dark surface without a separate asset). Works the same on the SVG as it did on the PNG.
  return (
    <Image
      src="/CareerCentra-full-logo.svg"
      alt="CareerCentra"
      width={180}
      height={50}
      className="brightness-0 invert"
    />
  );
}

function SocialBadge({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-deep-blue transition-opacity hover:opacity-85"
    >
      {children}
    </a>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M10.5 5H9.3c-.4 0-.6.3-.6.7V7h1.7l-.3 1.8H8.7V14H6.8V8.8H5.3V7h1.5V5.5C6.8 3.9 7.8 3 9.3 3h1.2v2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.3" cy="4.7" r="0.7" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.7 6v4l3.5-2-3.5-2z" fill="currentColor" />
    </svg>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-deep-blue px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Globally aligned certifications, executive programs, and workforce capability
              solutions that deliver measurable business outcomes.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialBadge href="https://x.com" label="X (Twitter)">
                <XIcon />
              </SocialBadge>
              <SocialBadge href="https://www.facebook.com/share/19a78hWFxt/?mibextid=wwXIfr" label="Facebook">
                <FacebookIcon />
              </SocialBadge>
              <SocialBadge href="https://www.instagram.com/careercentra?stkn=eHo0cTdrbGVwNXc5" label="Instagram">
                <InstagramIcon />
              </SocialBadge>
              <SocialBadge href="https://youtube.com" label="YouTube">
                <YoutubeIcon />
              </SocialBadge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Programs</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {PROGRAM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Solution</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SOLUTION_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal Terms</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">© 2026 iCentra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
