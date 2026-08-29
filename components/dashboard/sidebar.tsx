"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLogout } from "@/hooks/mutations/auth";
import { LogoutIcon, CollapseIcon, ChevronDownIcon } from "@/components/dashboard/nav-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
  children?: { label: string; href: string }[];
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const logout = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white py-6 transition-all ${
        collapsed ? "w-20 px-2" : "w-64 px-4"
      }`}
    >
      <div className={`flex items-center gap-2 px-2 ${collapsed ? "justify-center" : ""}`}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
          <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
          <path d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5" stroke="#0c236c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
        {!collapsed && <span className="text-xl font-semibold text-main">iCentra</span>}
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-gray-600"
      >
        <span className={collapsed ? "rotate-180" : ""}>
          <CollapseIcon />
        </span>
      </button>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const hasChildren = !!item.children?.length;
          const expanded = expandedKey === item.href;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setExpandedKey(expanded ? null : item.href)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-main text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {!collapsed && (
                    <span className={expanded ? "rotate-180" : ""}>
                      <ChevronDownIcon />
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-main text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </Link>
              )}

              {hasChildren && expanded && !collapsed && (
                <div className="ml-8 mt-1 flex flex-col gap-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        pathname === child.href ? "font-semibold text-main" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => logout.mutate()}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogoutIcon />
        {!collapsed && "Log Out"}
      </button>
    </aside>
  );
}
