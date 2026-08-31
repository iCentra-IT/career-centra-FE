"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useLogout } from "@/hooks/mutations/auth";
import { SiteSearch } from "@/components/marketing/site-search";

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

function CartLink() {
  const count = useCartStore((s) => s.items.length);

  return (
    <Link href="/cart" aria-label="Cart" className="relative text-gray-500 hover:text-main">
      <CartIcon />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {open ? (
        <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
        <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
        <path
          d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5"
          stroke="#0c236c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg> */}
      <span className="text-lg font-semibold text-main">Career Centra</span>
    </Link>
  );
}

const NAV_LINKS = [
  { label: "Home", href: "/", exact: true },
  { label: "Career Paths", href: "/career-paths" },
  { label: "Programs", href: "/programms" },
  { label: "Facilitator", href: "/facilitator" },
  { label: "Speak to Advisor", href: "/contact" },
];

function AccountMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!user) {
    return (
      <>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="text-gray-600 hover:text-main">
          Login
        </Link>
        <Link href="/registration" className="font-medium text-main hover:underline">
          Register
        </Link>
      </>
    );
  }

  const dashboardHref = user.role === "admin" ? "/admin" : "/students";
  const profileHref = user.role === "admin" ? "/admin/profile" : "/students/profile";
  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-main text-xs font-semibold text-white">
          {initials || "?"}
        </div>
        <span className="text-gray-700">{user.first_name}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
          <Link
            href={dashboardHref}
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export function MarketingHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref = user ? (user.role === "admin" ? "/admin" : "/students") : null;

  return (
    <header className="sticky top-0 z-30 bg-white relative">
      <div className=" px-6 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <div className="hidden items-center gap-5 text-sm md:flex">
            <CartLink />
            <AccountMenu />
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <CartLink />
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="text-gray-700"
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-gray-100 bg-[#E9F9FF] px-6 py-3 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <nav className="flex items-center gap-6 text-sm">
            {NAV_LINKS.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={isActive ? "font-semibold text-gray-900" : "text-gray-600 hover:text-main"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <SiteSearch className="w-full max-w-xs" />
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 max-h-[calc(100vh-56px)] overflow-y-auto border-b border-gray-100 bg-white px-6 py-4 shadow-lg md:hidden">
          <SiteSearch />

          <nav className="mt-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-2 py-2.5 text-sm ${
                    isActive ? "bg-secondary/5 font-semibold text-gray-900" : "text-gray-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
            {user ? (
              <>
                <Link
                  href={dashboardHref!}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout.mutate();
                  }}
                  className="rounded-md px-4 py-2.5 text-center text-sm font-medium text-red-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700"
                >
                  Login
                </Link>
                <Link
                  href="/registration"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md bg-main px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
