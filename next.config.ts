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
// allowlist instead. frame-src is scoped to youtube-nocookie.com for the review video embeds
// (components/marketing/review-video.tsx / lib/youtube.ts).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:;
  font-src 'self' data:;
  connect-src 'self' ${apiBaseUrl};
  frame-src https://www.youtube-nocookie.com;
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
};

export default nextConfig;
