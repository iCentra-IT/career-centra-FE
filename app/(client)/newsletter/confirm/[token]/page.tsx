import type { Metadata } from "next";
import { NewsletterActionContent } from "@/components/marketing/newsletter-action-content";

export const metadata: Metadata = {
  title: "Newsletter Confirm",
  robots: { index: false, follow: false },
};

export default async function NewsletterConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <NewsletterActionContent mode="confirm" token={token} />;
}
