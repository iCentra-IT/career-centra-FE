import type { Metadata } from "next";
import { HomeContent } from "@/components/marketing/home-content";

export const metadata: Metadata = {
  title: { absolute: "CareerCentra — Career Advancement Platform" },
  description:
    "Globally aligned certifications, executive programs, and workforce capability training in project management, agile, cybersecurity, AI and digital transformation. PMI and PECB Authorized Training Partner.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeContent />;
}
