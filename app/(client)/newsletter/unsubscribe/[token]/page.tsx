import type { Metadata } from "next";
import { NewsletterActionContent } from "@/components/marketing/newsletter-action-content";

export const metadata: Metadata = {
  title: "Newsletter Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function NewsletterUnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <NewsletterActionContent mode="unsubscribe" token={token} />;
}
