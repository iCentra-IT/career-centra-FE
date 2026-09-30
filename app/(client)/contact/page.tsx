import type { Metadata } from "next";
import { ContactContent } from "@/components/marketing/contact-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the CareerCentra team — book a training consultation or chat with us on WhatsApp for a quick response.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
