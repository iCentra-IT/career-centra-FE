import { CareerPathDetailContent } from "@/components/marketing/career-path-detail-content";

export default async function CareerPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CareerPathDetailContent slug={slug} />;
}
