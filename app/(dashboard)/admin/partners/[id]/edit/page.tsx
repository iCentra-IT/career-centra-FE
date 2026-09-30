"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useReferralPartner } from "@/hooks/queries/referral-partner";
import { usePatchReferralPartner } from "@/hooks/mutations/referral-partner";
import { useCoupons } from "@/hooks/queries/coupon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/ui/skeleton";

const CURRENCY_OPTIONS = ["USD", "NGN"];

const schema = z.object({
  name: z.string().min(1, "Partner name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  contact_email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  default_currency: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const EditReferralPartnerPage = () => {
  const params = useParams<{ id: string }>();
  const partnerId = Number(params.id);
  const router = useRouter();
  const { data: partner, isLoading } = useReferralPartner(partnerId);
  // The read side only exposes the coupon's code, not its id — best-effort match it against the
  // admin coupon list so the "edit terms" link below can point straight at it.
  const { data: coupons } = useCoupons();
  const matchedCoupon = coupons?.find((c) => c.code === partner?.coupon_code);
  const patchPartner = usePatchReferralPartner(partnerId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!partner) return;
    reset({
      name: partner.name,
      slug: partner.slug,
      contact_email: partner.contact_email,
      default_currency: partner.default_currency || "USD",
      is_active: partner.is_active,
    });
  }, [partner, reset]);

  const onSubmit = (values: FormValues) => {
    patchPartner.mutate(
      {
        name: values.name.trim(),
        slug: values.slug.trim(),
        contact_email: values.contact_email?.trim() ?? "",
        default_currency: values.default_currency || "USD",
        is_active: values.is_active,
      },
      {
        onSuccess: () => {
          toast.success("Partner updated.");
          router.push("/admin/partners");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) return <FormSkeleton fields={5} />;
  if (!partner) return <p className="text-sm text-gray-400">Partner not found.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900">Edit Referral Partner</h1>
      <p className="mt-1 text-sm text-gray-500">
        Update the partner&apos;s identity, public slug, and default currency.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <Input label="Partner Name" required error={errors.name?.message} {...register("name")} />
        <Input label="Public Slug" required error={errors.slug?.message} {...register("slug")} />
        <Input
          label="Contact Email"
          type="email"
          error={errors.contact_email?.message}
          {...register("contact_email")}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Default Currency</label>
          <select
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("default_currency")}
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-900">Coupon</p>
          <p className="text-xs text-gray-400">
            {partner.coupon_code}
            {matchedCoupon && (
              <>
                {" — "}
                <Link
                  href={`/admin/coupons/${matchedCoupon.id}/edit`}
                  className="font-medium text-secondary hover:underline"
                >
                  Edit discount terms
                </Link>
              </>
            )}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            {...register("is_active")}
          />
          Active
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/partners")}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <Button type="submit" loading={patchPartner.isPending} className="w-auto px-6">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditReferralPartnerPage;
