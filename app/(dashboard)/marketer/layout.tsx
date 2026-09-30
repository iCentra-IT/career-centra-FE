import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import {
  BlogIcon,
  TagIcon,
  StarIcon,
  ExchangeRateIcon,
  CouponsIcon,
  ProfileIcon,
} from "@/components/dashboard/nav-icons";

// Marketer is scoped to the blog — no access to the rest of the admin console.
const NAV_ITEMS = [
  { label: "Posts", href: "/marketer", icon: <BlogIcon />, exact: true },
  { label: "Categories", href: "/marketer/categories", icon: <TagIcon /> },
  { label: "Comments", href: "/marketer/comments", icon: <StarIcon /> },
  { label: "Analytics", href: "/marketer/analytics", icon: <ExchangeRateIcon /> },
  { label: "Newsletter", href: "/marketer/newsletter", icon: <CouponsIcon /> },
  { label: "Profile", href: "/marketer/profile", icon: <ProfileIcon /> },
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
