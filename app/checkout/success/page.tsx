import { CheckoutSuccessContent } from "@/components/marketing/checkout-success-content";

// The payment gateway's redirect_url is configured as the backend's own /api/checkout/confirm/
// (confirmed by a live sample — see hosted_pay's redirect_url), which verifies the charge and 302s
// the browser on to https://<frontend>/checkout/success or /checkout/failed. It never lands the
// browser on this app's own (unreachable) /api/checkout/confirm page — that page's comment claiming
// otherwise was wrong. Sits outside the (client) route group on purpose, same as the old page, so
// it renders as a bare full-screen confirmation without the marketing site's header/footer.
export default function CheckoutSuccessPage() {
  return <CheckoutSuccessContent />;
}
