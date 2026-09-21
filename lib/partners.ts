// Certifying/authorizing partners shown on the About and Partnerships pages. Badge dimensions are
// each file's real intrinsic pixel size (see public/badges/) so next/image gets the right ratio.
// `verifyUrl` is deliberately empty until iCentra supplies each body's public verification page —
// the Partnerships page only renders a "Verify" link when one is set.
export interface Partner {
  id: "pmi" | "pecb" | "microsoft";
  name: string;
  fullName: string;
  tag: string;
  badge: { src: string; alt: string; width: number; height: number };
  verifyUrl?: string;
}

export const PARTNERS: Partner[] = [
  {
    id: "pmi",
    name: "PMI",
    fullName: "Project Management Institute (PMI)",
    tag: "PMI Authorized Training Partner (ATP)",
    badge: {
      src: "/badges/pmi-authorized-training-partner.png",
      alt: "PMI Premier Authorized Training Partner",
      width: 800,
      height: 848,
    },
  },
  {
    id: "pecb",
    name: "PECB",
    fullName: "PECB (Professional Evaluation and Certification Board)",
    tag: "PECB Authorized Training Partner",
    badge: { src: "/badges/pecb-partner.png", alt: "PECB Gold Partner", width: 340, height: 402 },
  },
  {
    id: "microsoft",
    name: "Microsoft",
    fullName: "Microsoft",
    tag: "Microsoft Partner",
    badge: { src: "/badges/microsoft.png", alt: "Microsoft Partner", width: 146, height: 80 },
  },
];
