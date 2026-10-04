import type { Metadata } from "next";
import { UnsubscribeContent } from "@/components/marketing/unsubscribe-content";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <UnsubscribeContent token={token} />;
}
