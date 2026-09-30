import type { Metadata } from "next";
import { OrderReceipt } from "@/components/marketing/order-receipt";

// A customer's private order receipt — never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderReceipt orderId={Number(id)} />;
}
