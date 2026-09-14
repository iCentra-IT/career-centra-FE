import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Needed so next/image can serve our local SVG logo (public/CareerCentra-full-logo.svg) — off
    // by default since it lets the optimizer pass through arbitrary remote SVGs, but this is safe
    // for a same-origin, self-authored asset.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
