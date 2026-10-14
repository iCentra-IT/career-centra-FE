// Pushes CareerCentra application events onto the dataLayer that GTM's Meta Pixel tag already
// reads from — the Pixel itself is loaded by GTM (see app/layout.tsx's <GoogleTagManager>), not by
// this app, so this file must never call fbq() or load Meta's script directly.
//
// Doesn't augment the global Window type — @next/third-parties already declares `window.dataLayer`
// (as a looser `Object[]`), and TypeScript rejects two conflicting declarations of the same global.
type DataLayerEvent = Record<string, unknown>;

export function trackEvent(event: string, data: DataLayerEvent = {}) {
  if (typeof window === "undefined") return;

  const w = window as typeof window & { dataLayer?: DataLayerEvent[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...data });

  // Always logged (not gated on NODE_ENV) — GTM/Pixel testing usually happens against a
  // deployed preview or production build, where NODE_ENV is "production" too, so an env
  // gate would hide this exactly when it's needed. Lets you confirm an event actually
  // pushed to dataLayer straight from the browser console.
  console.log(`[trackEvent] ${event}`, data);
}
