"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogout } from "@/hooks/mutations/auth";
import { useDashboardChromeStore } from "@/lib/store/dashboardChromeStore";
import { LogoutIcon, CollapseIcon, ChevronDownIcon, GlobeIcon } from "@/components/dashboard/nav-icons";

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
  // Open the group that contains the current route by default.
  const [expandedKey, setExpandedKey] = useState<string | null>(
    () => items.find((i) => i.children?.length && pathname.startsWith(i.href))?.href ?? null,
  );

  const mobileOpen = useDashboardChromeStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useDashboardChromeStore((s) => s.closeMobileSidebar);

  // Below lg the sidebar is an off-canvas drawer toggled from the header — close it on navigation.
  useEffect(() => {
    closeMobileSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white px-4 py-6 transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] lg:duration-150 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20 lg:px-2" : "lg:w-64 lg:px-4"}`}
      >
        <div className={`flex items-center gap-2 px-2 ${collapsed ? "lg:justify-center" : ""}`}>
          <Image
            src="/CareerCentra-logo-icon.png"
            alt="CareerCentra"
            width={24}
            height={25}
            className="shrink-0"
          />
          <span className={`text-xl font-semibold text-main ${collapsed ? "lg:hidden" : ""}`}>
            CareerCentra
          </span>
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close menu"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 lg:hidden"
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-6 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-gray-600 lg:flex"
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
                    <span className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                    <span className={`${expanded ? "rotate-180" : ""} ${collapsed ? "lg:hidden" : ""}`}>
                      <ChevronDownIcon />
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-main text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </Link>
                )}

                {hasChildren && expanded && (
                  <div className={`ml-8 mt-1 flex flex-col gap-1 ${collapsed ? "lg:hidden" : ""}`}>
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

        <div className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-3">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 ${
              collapsed ? "lg:justify-center" : ""
            }`}
            title="Back to Website"
          >
            <GlobeIcon />
            <span className={collapsed ? "lg:hidden" : ""}>Back to Website</span>
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <LogoutIcon />
            <span className={collapsed ? "lg:hidden" : ""}>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
