import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import {
  DashboardIcon,
  ProgramsIcon,
  SettingsIcon,
} from "@/components/dashboard/nav-icons";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/facilitators", icon: <DashboardIcon />, exact: true },
  { label: "Program", href: "/facilitators/programs", icon: <ProgramsIcon /> },
  {
    label: "Settings",
    href: "/facilitators/settings",
    icon: <SettingsIcon />,
    children: [
      { label: "Profile", href: "/facilitators/settings/profile" },
      { label: "Public Profile", href: "/facilitators/settings/public-profile" },
      { label: "Security", href: "/facilitators/settings/security" },
    ],
  },
];

export default function FacilitatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar items={NAV_ITEMS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
