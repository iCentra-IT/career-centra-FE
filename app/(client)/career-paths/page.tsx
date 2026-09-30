import type { Metadata } from "next";
import { CareerPathsListContent } from "@/components/marketing/career-paths-list-content";

export const metadata: Metadata = {
  title: "Career Paths",
  description:
    "Explore structured career pathways at CareerCentra — curated program sequences built around your goals, experience, and desired career outcome.",
  alternates: { canonical: "/career-paths" },
};

export default function CareerPathsPage() {
  return <CareerPathsListContent />;
}
