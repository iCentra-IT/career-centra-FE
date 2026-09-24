// Display copy for public partner pages (/partners/[slug]) — there's no public "get partner by
// slug" endpoint (only GET /api/coupons/admin/partners/ which is admin-only), so the partner's
// name/description/copy has to live here rather than being fetched. The program list itself still
// comes live from GET /api/programs/?referral_partner=<slug>; only the branding text is static.
// Add an entry here for each new partnership; unlisted slugs fall back to a humanized version of
// the slug itself so the page still works, just without custom copy.
export interface PartnerPageCopy {
  title: string;
  tagline: string;
  description: string;
}

export const PARTNER_PAGE_COPY: Record<string, PartnerPageCopy> = {
  "pmi-dallas": {
    title: "PMI Dallas Chapter",
    tagline: "An Exclusive Partnership With CareerCentra",
    description:
      "As a PMI Dallas Chapter member, you get preferred pricing on CareerCentra's project management certification programs. Browse the programs below — your member discount is already reflected — then enter your chapter discount code at checkout to lock it in.",
  },
};

function humanize(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function partnerPageCopy(slug: string): PartnerPageCopy {
  return (
    PARTNER_PAGE_COPY[slug] ?? {
      title: humanize(slug),
      tagline: "An Exclusive Partnership With CareerCentra",
      description:
        "Browse your organization's featured programs below — your member discount is already reflected. Enter your discount code at checkout to lock it in.",
    }
  );
}
