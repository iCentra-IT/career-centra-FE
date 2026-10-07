import React from "react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { LeadMagnetModal } from "@/components/marketing/lead-magnet-modal";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col">
        <LeadMagnetModal />
        <MarketingHeader />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <MarketingFooter />
      </div>
    </MotionProvider>
  );
}
