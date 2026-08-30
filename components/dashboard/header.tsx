"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotifications } from "@/hooks/queries/notifications";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";

const PAGE_TITLES: { pattern: string; title: string }[] = [
  { pattern: "/admin/profile", title: "Profile" },
  { pattern: "/admin/programs", title: "Program" },
  { pattern: "/admin/career-paths", title: "Career Path" },
  { pattern: "/admin/facilitators", title: "Facilitator" },
  { pattern: "/admin/cohorts", title: "Cohorts" },
  { pattern: "/admin/users", title: "Users" },
  { pattern: "/admin/coupons", title: "Coupons" },
  { pattern: "/admin/enrollments", title: "Enrolments History" },
  { pattern: "/admin", title: "Dashboard" },
  { pattern: "/students/enrolments", title: "My Enrolments" },
  { pattern: "/students/schedules", title: "Class Schedules" },
  { pattern: "/students/certificates", title: "Certificates" },
  { pattern: "/students/purchase-history", title: "Purchase History" },
  { pattern: "/students/profile", title: "Profile" },
  { pattern: "/students", title: "Overview" },
];

const CREATE_PAGE_BREADCRUMBS: Record<
  string,
  { parent: string; parentHref: string; current: string }
> = {
  "/admin/cohorts/create": { parent: "Cohorts", parentHref: "/admin/cohorts", current: "Create Cohorts" },
  "/admin/coupons/create": { parent: "Coupon", parentHref: "/admin/coupons", current: "Create Coupons" },
};

function pageTitleFor(pathname: string) {
  const match = PAGE_TITLES.filter((p) => pathname.startsWith(p.pattern)).sort(
    (a, b) => b.pattern.length - a.pattern.length,
  )[0];
  return match?.title ?? "Dashboard";
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5c-2.2 0-4 1.8-4 4v2.3c0 .5-.2 1-.5 1.4L4.3 12c-.6.7-.1 1.8.8 1.8h9.8c.9 0 1.4-1.1.8-1.8l-1.2-1.8a2.3 2.3 0 01-.5-1.4V6.5c0-2.2-1.8-4-4-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.3 16a1.8 1.8 0 003.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "";

  const { data: notifications } = useNotifications();
  const hasUnread = (notifications ?? []).some((n) => !n.is_read);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNotificationsOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [notificationsOpen]);

  const breadcrumb = CREATE_PAGE_BREADCRUMBS[pathname];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-gray-100 bg-white px-8">
      {breadcrumb ? (
        <div className="flex shrink-0 items-center gap-2 text-sm">
          <Link href={breadcrumb.parentHref} className="flex items-center gap-1 font-medium text-secondary hover:underline">
            ← Back
          </Link>
          <span className="text-gray-300">|</span>
          <Link href={breadcrumb.parentHref} className="text-gray-400 hover:text-gray-600">
            {breadcrumb.parent}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">{breadcrumb.current}</span>
        </div>
      ) : (
        <h1 className="shrink-0 text-lg font-semibold text-gray-900">{pageTitleFor(pathname)}</h1>
      )}

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          placeholder="Search here for anything..."
          className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-14 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
          ⌘K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div ref={containerRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50"
          >
            <BellIcon />
            {hasUnread && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>
          {notificationsOpen && (
            <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-main text-xs font-semibold text-white">
            {initials || "?"}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              {user ? `${user.first_name} ${user.last_name}` : "—"}
            </p>
            <p className="text-xs capitalize text-gray-400">{user?.role ?? ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
