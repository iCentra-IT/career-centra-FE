import type { Metadata } from "next";
import { CartContent } from "@/components/marketing/cart-content";

// A visitor's own cart contents — nothing worth indexing, and not a good search landing page.
export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartContent />;
}
