"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOnboardReferralPartner } from "@/hooks/mutations/referral-partner";
import { ReferralPartnerOnboardForm } from "@/components/dashboard/referral-partner-onboard-form";

const CreateReferralPartnerPage = () => {
  const router = useRouter();
  const onboard = useOnboardReferralPartner();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Onboard Referral Partner</h1>
      <p className="mt-1 text-sm text-gray-500">
        Creates the discount coupon and the partner&apos;s public catalog page together.
      </p>

      <div className="mt-8">
        <ReferralPartnerOnboardForm
          isPending={onboard.isPending}
          onClose={() => router.push("/admin/partners")}
          onSubmit={(payload) =>
            onboard.mutate(payload, {
              onSuccess: () => {
                toast.success("Partner onboarded.");
                router.push("/admin/partners");
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      </div>
    </div>
  );
};

export default CreateReferralPartnerPage;
