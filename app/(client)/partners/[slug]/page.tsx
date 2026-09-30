import type { Metadata } from "next";
import { partnerPageCopy } from "@/lib/referral-partners";
import { PartnerPageContent } from "@/components/marketing/partner-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const copy = partnerPageCopy(slug);
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/partners/${slug}` },
  };
}

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PartnerPageContent slug={slug} />;
}
