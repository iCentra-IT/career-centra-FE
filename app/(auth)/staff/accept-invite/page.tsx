import { AcceptInviteContent } from "@/components/marketing/accept-invite-content";

// The invite email points here, e.g. /staff/accept-invite?token=...
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AcceptInviteContent token={token} />;
}
