import React from "react";
import type { Metadata } from "next";

// Covers every dashboard route group in one place (admin, students, facilitators, marketer) —
// private, behind-login areas with no reason to be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
