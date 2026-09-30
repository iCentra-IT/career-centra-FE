import type { Metadata } from "next";
import { FacilitatorContent } from "@/components/marketing/facilitator-content";

export const metadata: Metadata = {
  title: "Become a Facilitator",
  description:
    "Join CareerCentra as a certified facilitator — lead practitioner-led training in project management, agile, cybersecurity, AI and digital transformation.",
  alternates: { canonical: "/facilitator" },
};

export default function FacilitatorPage() {
  return <FacilitatorContent />;
}
