import type { Metadata } from "next";
import { BlogLandingContent } from "@/components/marketing/blog-landing-content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical guidance on certifications, project management, and building a career that keeps up with the industry — from the CareerCentra team.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <BlogLandingContent />;
}
