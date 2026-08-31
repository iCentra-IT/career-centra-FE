export const PATHWAY_CATEGORIES = [
  { label: "Project Management", programType: "Project & Portfolio Management" },
  { label: "Agile & Product", programType: "Agile, Product & Business Analysis" },
  { label: "Cybersecurity", programType: "Cybersecurity & Risk" },
  { label: "Digital & AI", programType: "AI & Digital Transformation" },
] as const;

// Matches a career path's title to one of the four known pathway categories above by keyword,
// so its icon reflects what it actually is rather than a rotating index. Returns -1 if the title
// doesn't match any known category (caller should fall back to a rotating icon in that case).
export function matchPathwayCategory(title: string): number {
  const t = title.toLowerCase();
  if (t.includes("project") || t.includes("portfolio")) return 0;
  if (t.includes("agile") || t.includes("product") || t.includes("business analysis")) return 1;
  if (t.includes("cyber") || t.includes("risk")) return 2;
  if (t.includes("digital") || t.includes("ai")) return 3;
  return -1;
}
