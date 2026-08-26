"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/mutations/auth";
import { LogoutIcon } from "@/components/dashboard/nav-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
          <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
          <path d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5" stroke="#0c236c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
        <span className="text-xl font-semibold text-main">iCentra</span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-main text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => logout.mutate()}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogoutIcon />
        Log Out
      </button>
    </aside>
  );
}
