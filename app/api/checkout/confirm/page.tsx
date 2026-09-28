import { CheckoutConfirmContent } from "@/components/marketing/checkout-confirm-content";

// CORRECTION (confirmed live): the gateway's redirect_url actually points at the *backend's* own
// /api/checkout/confirm/ (on api-learning.icentra.com), which verifies server-side and then 302s
// the browser on to the frontend's /checkout/success or /checkout/failed — see those routes. The
// browser never actually lands on this page; it's unreachable dead code, kept only because nothing
// else references this exact path. Safe to delete once confirmed nothing external links here.
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
