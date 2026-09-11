import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import {
  DashboardIcon,
  EnrolmentsHistoryIcon,
  PlayCircleIcon,
  TicketIcon,
  FacilitatorGroupIcon,
  TagIcon,
  ProfileIcon,
  CouponsIcon,
  CertificatesIcon,
  SettingsIcon,
} from "@/components/dashboard/nav-icons";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon />, exact: true },
  { label: "Enrolments History", href: "/admin/enrollments", icon: <EnrolmentsHistoryIcon /> },
  { label: "Program", href: "/admin/programs", icon: <PlayCircleIcon /> },
  { label: "Career Path", href: "/admin/career-paths", icon: <TicketIcon /> },
  { label: "Facilitator", href: "/admin/facilitators", icon: <FacilitatorGroupIcon /> },
  { label: "Cohorts", href: "/admin/cohorts", icon: <TagIcon /> },
  { label: "Users", href: "/admin/users", icon: <ProfileIcon /> },
  { label: "Coupons", href: "/admin/coupons", icon: <CouponsIcon /> },
  { label: "Certificates", href: "/admin/certificates", icon: <CertificatesIcon /> },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <SettingsIcon />,
    children: [
      { label: "Profile", href: "/admin/profile" },
      { label: "Exchange Rates", href: "/admin/exchange-rates" },
    ],
  },
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
