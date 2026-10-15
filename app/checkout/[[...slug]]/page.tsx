import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Safety net for any /checkout/* path that isn't /checkout/success or /checkout/failed — most
// importantly the bare /checkout itself, which had no page at all (404) before this.
//
// Why this exists: Flutterwave uses one redirect_url for every outcome (differentiated by
// ?status=), which the backend already routes through /api/checkout/confirm/ and on to
// /checkout/success or /checkout/failed — confirmed live. Stripe Checkout Sessions, though, take a
// *separate* cancel_url field. If that field isn't pointed at the same backend-confirm flow (or at
// an existing frontend path at all), clicking Stripe's own cancel/back link sends the browser
// straight to whatever cancel_url the session was created with — bypassing our redirect-translation
// entirely. That's a backend fix (the Stripe Checkout Session's cancel_url), not something this
// route can correct; this just stops the dead end from being a 404 in the meantime, and forwards
// along any reason/ref/status the gateway did send.
export default async function CheckoutRootPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
  }
  if (!qs.has("reason")) qs.set("reason", "payment_incomplete");
  redirect(`/checkout/failed?${qs.toString()}`);
}
