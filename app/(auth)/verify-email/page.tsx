import { VerifyEmailContent } from "@/components/marketing/verify-email-content";

// The link sent on registration points here, e.g. /verify-email?token=...
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <VerifyEmailContent token={token} />;
}
