"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/queries/notifications";
import { useMarkAllNotificationsRead } from "@/hooks/mutations/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { formatShortDate } from "@/lib/format";

// This panel is shared by the admin, facilitator, and student dashboards (see the three
// (dashboard)/*/layout.tsx files), so "which section am I in" has to come from the current path —
// there's no single right prefix to hardcode.
function dashboardSectionRoot(pathname: string): "/admin" | "/facilitators" | "/students" {
  if (pathname.startsWith("/admin")) return "/admin";
  if (pathname.startsWith("/facilitators")) return "/facilitators";
  return "/students";
}

// Confirmed live (student account): notification.action_url comes back as an absolute URL like
// "https://<frontend>/dashboard/certificates" or ".../dashboard/enrollments/{id}" — a /dashboard
// prefix and US "enrollments" spelling that don't match this app's real routes (/students/... and
// "enrolments"), so following it as-is 404s every time. Normalize the known cases per section and
// fall back to that section's own root (never 404s) for anything else, rather than trusting the
// raw value. Admin has both /admin/certificates and /admin/enrollments so maps cleanly; facilitators
// has neither, so falls back to its dashboard root.
function resolveNotificationUrl(actionUrl: string, sectionRoot: string): string {
  let pathname = actionUrl;
  try {
    pathname = new URL(actionUrl, window.location.origin).pathname;
  } catch {
    // Already a relative path — use as-is.
  }

  if (pathname === "/dashboard/certificates") {
    return sectionRoot === "/facilitators" ? sectionRoot : `${sectionRoot}/certificates`;
  }
  if (/^\/dashboard\/enrollments\/\d+$/.test(pathname)) {
    // No per-enrollment detail page exists anywhere yet — land on the closest list instead.
    if (sectionRoot === "/admin") return "/admin/enrollments";
    if (sectionRoot === "/students") return "/students/enrolments";
    return sectionRoot;
  }
  if (pathname.startsWith("/dashboard/")) return `${sectionRoot}${pathname.slice("/dashboard".length)}`;
  if (pathname === sectionRoot || pathname.startsWith(`${sectionRoot}/`)) return pathname;
  return sectionRoot;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const sectionRoot = dashboardSectionRoot(usePathname());

  const hasUnread = (notifications ?? []).some((n) => !n.is_read);

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-gray-50 px-5 py-3.5 last:border-0">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        {!isLoading && (notifications ?? []).length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-400">You&apos;re all caught up.</p>
        )}
        {notifications?.map((notification) => {
          const content = (
            <div
              className={`px-5 py-3.5 ${
                notification.is_read ? "" : "bg-secondary/5"
              }`}
            >
              <p className={`text-sm ${notification.is_read ? "text-gray-500" : "font-medium text-gray-900"}`}>
                {notification.title}
              </p>
              {notification.body && (
                <p className="mt-0.5 text-xs text-gray-500">{notification.body}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">{formatShortDate(notification.created_at)}</p>
            </div>
          );

          return notification.action_url ? (
            <Link
              key={notification.id}
              href={resolveNotificationUrl(notification.action_url, sectionRoot)}
              onClick={onClose}
              className="block border-b border-gray-50 last:border-0 hover:bg-gray-50"
            >
              {content}
            </Link>
          ) : (
            <div key={notification.id} className="border-b border-gray-50 last:border-0">
              {content}
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 text-right">
        <button
          type="button"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() =>
            markAllRead.mutate(undefined, {
              onError: (err) => toast.error(err.message),
            })
          }
          className="text-sm font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}
