import { ProgramDetailContent } from "@/components/marketing/program-detail-content";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProgramDetailContent slug={id} />;
}
