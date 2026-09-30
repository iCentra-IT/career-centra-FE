import type { Metadata } from "next";
import { ProgramsListContent } from "@/components/marketing/programs-list-content";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Browse CareerCentra's full catalogue of certification programs — project management, agile, cybersecurity, AI and digital transformation courses with live cohorts.",
  alternates: { canonical: "/programms" },
};

export default function ProgramsPage() {
  return <ProgramsListContent />;
}
