import { CheckoutConfirmContent } from "@/components/marketing/checkout-confirm-content";

// Flutterwave's own redirect_url lands the browser back here — on both a completed and a
// cancelled checkout — e.g. /api/checkout/confirm/?status=successful&tx_ref=ICT-...&transaction_id=...
// There's no route.ts alongside this page, so it renders normally instead of hitting a Route Handler.
export default async function CheckoutConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }>;
}) {
  const { status, tx_ref, transaction_id } = await searchParams;

  return <CheckoutConfirmContent status={status} txRef={tx_ref} transactionId={transaction_id} />;
}
