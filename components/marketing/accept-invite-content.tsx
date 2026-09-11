"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAcceptStaffInvite } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";

const acceptInviteSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one upper case")
      .regex(/[a-z]/, "At least one lower case")
      .regex(/[^A-Za-z0-9]/, "At least one special character")
      .regex(/[0-9]/, "At least one number"),
    password2: z.string(),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });
type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

export function AcceptInviteContent({ token }: { token?: string }) {
  const router = useRouter();
  const acceptInvite = useAcceptStaffInvite();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AcceptInviteFormValues>({ resolver: zodResolver(acceptInviteSchema) });
  const password = useWatch({ control, name: "password" }) ?? "";

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invite link invalid</h1>
        <p className="mt-2 text-sm text-gray-500">
          This link is missing its invite token. Ask whoever invited you to resend it.
        </p>
        <Link href="/login" className="mt-6 block">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = (values: AcceptInviteFormValues) => {
    acceptInvite.mutate(
      { token, ...values },
      {
        onSuccess: () => {
          toast.success("Account activated — you can now log in.");
          router.push("/login");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Set Your Password</h1>
      <p className="mt-1 text-sm text-gray-500">
        You&apos;ve been invited to join the iCentra team. Choose a password to activate your
        account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <Input
            label="Password"
            type="password"
            required
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          required
          placeholder="Confirm your password"
          error={errors.password2?.message}
          {...register("password2")}
        />

        <Button type="submit" loading={acceptInvite.isPending}>
          Activate Account
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-semibold text-main hover:underline"
      >
        Go Back to Login
      </Link>
    </div>
  );
}
