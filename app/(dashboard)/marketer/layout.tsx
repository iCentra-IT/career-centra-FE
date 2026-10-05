import React from "react";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import {
  BlogIcon,
  TagIcon,
  StarIcon,
  ExchangeRateIcon,
  CouponsIcon,
  ProfileIcon,
  DashboardIcon,
  HandshakeIcon,
  ScheduleIcon,
  FacilitatorGroupIcon,
  CohortsIcon,
  OverviewIcon,
} from "@/components/dashboard/nav-icons";

// Marketer is scoped to the CRM, learner visibility and blog tools — no access to the admin console.
// Grouped by job so the sidebar reads top-down: start on the dashboard, work the pipeline, then
// content and account settings.
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/marketer/crm", icon: <DashboardIcon />, exact: true, section: "Overview" },

  { label: "Leads", href: "/marketer/crm/leads", icon: <HandshakeIcon />, section: "CRM" },
  { label: "Follow-up Tasks", href: "/marketer/crm/tasks", icon: <ScheduleIcon /> },
  { label: "Campaigns", href: "/marketer/crm/campaigns", icon: <ExchangeRateIcon /> },
  { label: "Lead Magnets", href: "/marketer/crm/lead-magnets", icon: <TagIcon /> },

  { label: "Learners", href: "/marketer/learners", icon: <FacilitatorGroupIcon />, section: "People" },

  { label: "Posts", href: "/marketer", icon: <BlogIcon />, exact: true, section: "Blog" },
  { label: "Categories", href: "/marketer/categories", icon: <CohortsIcon /> },
  { label: "Comments", href: "/marketer/comments", icon: <StarIcon /> },
  { label: "Newsletter", href: "/marketer/newsletter", icon: <CouponsIcon /> },
  { label: "Analytics", href: "/marketer/analytics", icon: <OverviewIcon /> },

  { label: "Profile", href: "/marketer/profile", icon: <ProfileIcon />, section: "Account" },
];

export default function MarketerLayout({
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
