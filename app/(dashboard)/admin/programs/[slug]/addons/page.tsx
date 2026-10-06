"use client";

import { use } from "react";
import { ProgramAddonsPage } from "@/components/dashboard/addons/program-addons-page";

export default function ProgramAddonsRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <ProgramAddonsPage programSlug={slug} />;
}
