"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";

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
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "";

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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-8">
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>

      <div className="flex items-center gap-4">
        <div ref={containerRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50"
          >
            <BellIcon />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
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
