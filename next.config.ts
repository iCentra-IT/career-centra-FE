import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// The only API origin the app ever fetches from (lib/api/client.ts's apiClient baseURL) — needed
// in connect-src or every data fetch gets blocked once a CSP is in place.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// No nonces: this site is mostly statically rendered (see the build output — almost every route
// is ○ Static), and nonce-based CSP requires *all* pages to be dynamically rendered (see
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md), which would be a much
// bigger, riskier change than what a header scan warrants. 'unsafe-inline' on script/style is the
// documented fallback for exactly this case.
//
// img-src stays broad (https: data: blob:) because programs/reviews/badges embed arbitrary
// admin-supplied image URLs from whatever host the backend hands back (see the
// no-next/image-domains comments next to those <img> tags) — there's no fixed CDN domain to
// allowlist instead. `http:` is added only in dev: the local backend serves media over plain
// http (e.g. http://localhost:8005/media/...), which `https:` alone silently blocks — confirmed
// live, the image 404s with a broken-image icon even though curling the URL directly returns
// 200. Production backends are always https, so prod never needs the http: scheme and stays
// stricter. frame-src covers youtube-nocookie.com (review video embeds — see
// components/marketing/review-video.tsx / lib/youtube.ts) and challenges.cloudflare.com
// (Cloudflare Turnstile's widget iframe — see components/ui/turnstile-widget.tsx). Turnstile's
// own script also needs an explicit script-src entry, confirmed live: without it the browser
// blocks "https://challenges.cloudflare.com/turnstile/v0/api.js" outright and the widget never
// renders at all (script-src has no fallback to default-src once it's set explicitly).
//
// googletagmanager.com in script-src loads gtm.js itself (see the <GoogleTagManager> in
// app/layout.tsx); google-analytics.com (plus its region-pinned subdomains, e.g.
// region1.google-analytics.com) in connect-src is where the GA4 tag configured inside that GTM
// container actually sends hits — same "blocked outright, not just a console warning" story as
// Turnstile above if either is missing.
//
// The Meta Pixel is also deployed through that same GTM container, and it loads its own scripts
// (connect.facebook.net/en_US/fbevents.js and connect.facebook.net/signals/config/{id}) plus
// beacons events back to facebook.com/tr. GTM alone isn't enough: without connect.facebook.net in
// script-src the browser blocks fbevents.js (confirmed live — the Pixel never initializes and is
// undetected), and without facebook.com/connect.facebook.net in connect-src the event beacons are
// blocked too. Per Meta's CSP guidance (developers.facebook.com/docs/meta-pixel/advanced):
// allow script loads from connect.facebook.net. img-src already permits the tracking pixel image
// via its broad `https:` source.
//  connect-src 'self' ${apiBaseUrl} https://challenges.cloudflare.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://www.facebook.com;

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://connect.facebook.net https://www.clarity.ms${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:${isDev ? " http:" : ""};
  font-src 'self' data:;
  connect-src 'self' ${apiBaseUrl} https://challenges.cloudflare.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://www.facebook.com https://mpc-prod-23-s6uit34pua-ue.a.run.app https://5z-2b6b7616f94640c2840d1841e1ac24c3.ecs.us-east-1.on.aws;
  frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  images: {
    // Needed so next/image can serve our local SVG logo (public/CareerCentra-full-logo.svg) — off
    // by default since it lets the optimizer pass through arbitrary remote SVGs, but this is safe
    // for a same-origin, self-authored asset.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Belt-and-braces with the CSP's frame-ancestors 'none' above — some scanners (and
          // older browsers) check this header on its own rather than accepting frame-ancestors
          // as a substitute.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },

  // Canonicalizes the apex domain — metadataBase/sitemap.ts/robots.ts (app/layout.tsx) all assume
  // the bare domain, so a visit to the www host gets 301'd there instead of serving duplicate
  // content under two hosts.
  // async redirects() {
  //   return [
  //     {
  //       source: "/:path*",
  //       has: [
  //         {
  //           type: "host",
  //           value: "www.careercentra.icentra.com",
  //         },
  //       ],
  //       destination: "https://careercentra.icentra.com/:path*",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
