"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRegister } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import type { Industry, ReferralSource } from "@/types/student";

// Mirrors the backend's IndustryChoices / ReferralSourceChoices.
const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "finance_and_banking", label: "Finance and Banking" },
  { value: "real_estate", label: "Real Estate" },
  { value: "construction", label: "Construction" },
  { value: "oil_and_gas", label: "Oil and Gas" },
  { value: "hospitality_and_tourism", label: "Hospitality and Tourism" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "information_technology", label: "Information Technology" },
  { value: "healthcare_and_pharmaceuticals", label: "Healthcare and Pharmaceuticals" },
  { value: "others", label: "Others" },
];

const REFERRAL_SOURCE_OPTIONS: { value: ReferralSource; label: string }[] = [
  { value: "friend", label: "Friend" },
  { value: "relative", label: "Relative" },
  { value: "colleague", label: "Colleague" },
  { value: "social_media", label: "Social Media" },
  { value: "sponsored_ads", label: "Sponsored Ads" },
  { value: "icentra_website", label: "Icentra Website" },
  { value: "others", label: "Others" },
];

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="#0c236c" strokeWidth="3" />
        <circle cx="14" cy="10" r="2.5" fill="#1875f0" />
        <path
          d="M8 20c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5"
          stroke="#0c236c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-2xl font-semibold text-main">iCentra</span>
    </div>
  );
}

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().min(1, "Phone number is required"),
    location: z.string().min(1, "Location is required"),
    password: z.string().min(8, "At least 8 characters"),
    password2: z.string().min(1, "Please confirm your password"),
    org_name: z.string().min(1, "Organisation name is required"),
    position: z.string().min(1, "Position is required"),
    years_of_experience: z.coerce.number().min(0, "Years of experience is required"),
    industry: z.enum(
      INDUSTRY_OPTIONS.map((o) => o.value) as [Industry, ...Industry[]],
      { errorMap: () => ({ message: "Industry is required" }) },
    ),
    referral_source: z.enum(
      REFERRAL_SOURCE_OPTIONS.map((o) => o.value) as [ReferralSource, ...ReferralSource[]],
      { errorMap: () => ({ message: "Referral source is required" }) },
    ),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const STEP1_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "location",
  "password",
  "password2",
] as const;

const RegistrationPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "organisation">("account");
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { years_of_experience: 0 },
  });

  const password = watch("password") ?? "";

  const goToOrganisation = async () => {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep("organisation");
  };

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Account created — you can now log in.");
        router.push("/login");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-zinc-50 px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(12,35,108,0.08) 1.5px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 text-sm">
        {step === "account" ? (
          <Link href="/login" className="flex items-center gap-1 font-medium text-secondary hover:underline">
            ← Back
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep("account")}
            className="flex items-center gap-1 font-medium text-secondary hover:underline"
          >
            ← Back
          </button>
        )}
        <span className="text-gray-300">|</span>
        <span className="font-semibold text-gray-900">Create account</span>
      </div>

      <div className="mx-auto mt-6 w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <Logo />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            {step === "account" ? (
              <>
                <h1 className="text-center text-2xl font-semibold text-gray-900">
                  Create Your Account
                </h1>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Welcome! Registering with us gives you access to world-class thought leadership,
                  free templates, free e-learnings and much more.
                </p>

                <div className="mt-6 flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      required
                      placeholder="Enter your first name"
                      error={errors.first_name?.message}
                      {...register("first_name")}
                    />
                    <Input
                      label="Last Name"
                      required
                      placeholder="Enter your last name"
                      error={errors.last_name?.message}
                      {...register("last_name")}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <Input
                    label="Phone Number"
                    required
                    placeholder="Enter your phone number"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                  <Input
                    label="Location"
                    required
                    placeholder="Enter your city"
                    error={errors.location?.message}
                    {...register("location")}
                  />
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      error={errors.password?.message}
                      {...register("password")}
                    />
                    {password && <PasswordStrength password={password} />}
                  </div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    placeholder="Re-enter your password"
                    error={errors.password2?.message}
                    {...register("password2")}
                  />
                </div>

                <Button type="button" onClick={goToOrganisation} className="mt-6">
                  Continue
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-center text-2xl font-semibold text-gray-900">
                  Enter Details About Your Organisation
                </h1>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Welcome! Registering with us gives you access to world-class thought leadership,
                  free templates, free e-learnings and much more.
                </p>

                <div className="mt-6 flex flex-col gap-5">
                  <Input
                    label="Organisation Name"
                    required
                    placeholder="Enter your organisation name"
                    error={errors.org_name?.message}
                    {...register("org_name")}
                  />
                  <Input
                    label="Position"
                    required
                    placeholder="Enter your position"
                    error={errors.position?.message}
                    {...register("position")}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    min={0}
                    required
                    placeholder="Enter years of experience"
                    error={errors.years_of_experience?.message}
                    {...register("years_of_experience")}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-900">
                      Industry <span className="text-secondary">*</span>
                    </label>
                    <select
                      defaultValue=""
                      className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                      {...register("industry")}
                    >
                      <option value="" disabled>
                        select
                      </option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.industry && (
                      <p className="text-xs text-red-500">{errors.industry.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-900">
                      Referral Source <span className="text-secondary">*</span>
                    </label>
                    <select
                      defaultValue=""
                      className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                      {...register("referral_source")}
                    >
                      <option value="" disabled>
                        select
                      </option>
                      {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.referral_source && (
                      <p className="text-xs text-red-500">{errors.referral_source.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" loading={registerMutation.isPending} className="mt-6">
                  Continue
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("account")}
                  className="mt-3 block w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  Back
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-xs text-gray-400">
        By clicking sign in, you agree to our{" "}
        <span className="font-medium text-secondary">Terms and Condition</span> and{" "}
        <span className="font-medium text-secondary">Privacy Statement</span>
      </p>
    </div>
  );
};

export default RegistrationPage;
