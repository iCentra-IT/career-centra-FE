import type { Metadata } from "next";
import { ProgramDetailContent } from "@/components/marketing/program-detail-content";
import { getProgram } from "@/lib/api/programs";
import { displayTitle } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const program = await getProgram(id);
    const title = displayTitle(program.title);
    return {
      title,
      description: program.summary,
      alternates: { canonical: `/programms/${program.slug}` },
      openGraph: {
        title,
        description: program.summary,
        type: "website",
        ...(program.cover_image_url && { images: [{ url: program.cover_image_url }] }),
      },
    };
  } catch {
    // A bad/old slug still renders (ProgramDetailContent shows its own "not found" state) — just
    // fall back to generic metadata instead of failing the whole page.
    return { title: "Program" };
  }
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProgramDetailContent slug={id} />;
}
