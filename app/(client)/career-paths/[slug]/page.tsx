import type { Metadata } from "next";
import { CareerPathDetailContent } from "@/components/marketing/career-path-detail-content";
import { getCareerPath } from "@/lib/api/career-paths";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const path = await getCareerPath(slug);
    return {
      title: path.title,
      description: path.excerpt,
      alternates: { canonical: `/career-paths/${path.slug}` },
      openGraph: { title: path.title, description: path.excerpt, type: "website" },
    };
  } catch {
    return { title: "Career Path" };
  }
}

export default async function CareerPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CareerPathDetailContent slug={slug} />;
}
