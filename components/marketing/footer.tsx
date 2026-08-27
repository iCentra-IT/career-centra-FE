import Link from "next/link";

const COLUMNS = [
  {
    title: "Quick Link",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Media Room", href: "/about" },
    ],
  },
  {
    title: "About iCentra",
    links: [
      { label: "Who we are", href: "/about" },
      { label: "Leadership Team", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Media Room", href: "/about" },
    ],
  },
  {
    title: "Our Solution",
    links: [
      { label: "Continuous Transformation", href: "/about" },
      { label: "Our solution", href: "/about" },
      { label: "Platforms", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

function SocialIcon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-deep-blue px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="12" stroke="#00dbff" strokeWidth="3" />
                <circle cx="14" cy="10" r="2.5" fill="#00afeb" />
                <path
                  d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5"
                  stroke="#00dbff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="text-lg font-semibold">iCentra</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Transforming people &amp; organizations for excellence.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">© 2026 iCentra. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/60">
            <SocialIcon path="M2 2l12 12M14 2L2 14" />
            <SocialIcon path="M11 2H9a3 3 0 00-3 3v2H4v3h2v6h3V10h2.2L11.5 7H9V5.2c0-.4.3-.7.7-.7H11V2z" />
            <SocialIcon path="M3 3h10v10H3zM8 6.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10.7 4.8h.01" />
            <SocialIcon path="M2 4.5l6 3.5-6 3.5v-7zM8 4h6v8H8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
