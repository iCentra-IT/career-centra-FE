import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OverviewIcon, ProgramsIcon, CohortsIcon, ProfileIcon } from "@/components/dashboard/nav-icons";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: <OverviewIcon />, exact: true },
  { label: "Programs", href: "/admin/programs", icon: <ProgramsIcon /> },
  { label: "Cohorts", href: "/admin/cohorts", icon: <CohortsIcon /> },
  { label: "Profile", href: "/admin/profile", icon: <ProfileIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar items={NAV_ITEMS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
