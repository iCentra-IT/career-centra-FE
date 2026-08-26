import Link from "next/link";

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 2h1.5l1.5 9.5h9l1.5-6.5H4.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="15" r="1.1" fill="currentColor" />
      <circle cx="13" cy="15" r="1.1" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
        <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
        <path
          d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5"
          stroke="#0c236c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-lg font-semibold text-main">iCentra</span>
    </Link>
  );
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Career Paths", href: "/#pathways" },
  { label: "Speak to Advisor", href: "/contact" },
  { label: "About", href: "/about" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="bg-secondary/5 px-6 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-5 text-sm">
            <button type="button" aria-label="Cart" className="text-gray-500 hover:text-main">
              <CartIcon />
            </button>
            <Link href="/login" className="text-gray-600 hover:text-main">
              Login
            </Link>
            <Link href="/registration" className="font-medium text-main hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-main">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              placeholder="Search programs..."
              className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
