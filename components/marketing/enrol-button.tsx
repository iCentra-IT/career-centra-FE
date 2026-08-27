"use client";

import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useStudentProfile } from "@/hooks/queries/students";
import { useInitiateCheckout } from "@/hooks/mutations/enrollment";

export function EnrolButton({
  cohortId,
  enrollmentOpen = true,
  className,
  children,
}: {
  cohortId?: number;
  enrollmentOpen?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { data: studentProfile } = useStudentProfile();
  const initiateCheckout = useInitiateCheckout();

  const handleClick = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!cohortId) return;

    const countryCode = studentProfile?.country || "US";
    const currency = countryCode === "NG" ? "NGN" : "USD";

    initiateCheckout.mutate(
      { cohort_id: cohortId, country_code: countryCode, currency, coupon_code: "" },
      {
        onSuccess: (data) => {
          window.location.href = data.gateway_url;
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const disabled = !!user && (!cohortId || !enrollmentOpen || initiateCheckout.isPending);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={user && !enrollmentOpen ? "Enrollment isn't open for this cohort yet" : undefined}
      className={className}
    >
      {initiateCheckout.isPending ? "Redirecting…" : children}
    </button>
  );
}
