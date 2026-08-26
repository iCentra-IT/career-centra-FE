import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import {
  OverviewIcon,
  EnrolmentsIcon,
  ScheduleIcon,
  CertificatesIcon,
  PurchaseHistoryIcon,
  ProfileIcon,
} from "@/components/dashboard/nav-icons";

const NAV_ITEMS = [
  { label: "Overview", href: "/students", icon: <OverviewIcon />, exact: true },
  { label: "My Enrolments", href: "/students/enrolments", icon: <EnrolmentsIcon /> },
  { label: "Class Schedules", href: "/students/schedules", icon: <ScheduleIcon /> },
  { label: "Certificates", href: "/students/certificates", icon: <CertificatesIcon /> },
  { label: "Purchase History", href: "/students/purchase-history", icon: <PurchaseHistoryIcon /> },
  { label: "Profile", href: "/students/profile", icon: <ProfileIcon /> },
];

export default function StudentsLayout({
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
