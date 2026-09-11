import { OrderReceipt } from "@/components/marketing/order-receipt";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderReceipt orderId={Number(id)} />;
}
