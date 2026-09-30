import type { MetadataRoute } from "next";

const SITE_URL = "https://careercentra.icentra.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything behind a login (dashboards for every role, auth flows, cart/checkout/orders)
      // has no reason to be indexed and, for the dashboards, is duplicate/private content anyway —
      // matches the per-route `robots: noindex` metadata on each of these route groups, which
      // handles a visitor who's already logged in and crawled with a session; this covers a bot
      // that never authenticates at all.
      disallow: [
        "/admin",
        "/admin/",
        "/marketer",
        "/marketer/",
        "/students",
        "/students/",
        "/facilitators",
        "/facilitators/",
        "/login",
        "/registration",
        "/forgot-password",
        "/verify-email",
        "/staff/",
        "/cart",
        "/orders/",
        "/checkout/",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
