import { CheckoutConfirmContent } from "@/components/marketing/checkout-confirm-content";

// Backend's redirect_url for both gateways lands the browser back here after it has already
// verified the payment server-side — on a completed checkout as well as a cancelled one.
// Flutterwave:  /api/checkout/confirm/?status=successful&tx_ref=ICT-...&transaction_id=...
// Stripe:       /api/checkout/confirm/?session_id=cs_...&ref=ICT-...
// There's no route.ts alongside this page, so it renders normally instead of hitting a Route Handler.
export default async function CheckoutConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    tx_ref?: string;
    transaction_id?: string;
    session_id?: string;
    ref?: string;
  }>;
}) {
  const { status, tx_ref, transaction_id, session_id, ref } = await searchParams;

  return (
    <CheckoutConfirmContent
      status={status}
      txRef={tx_ref}
      transactionId={transaction_id}
      sessionId={session_id}
      paymentRef={ref}
    />
  );
}
