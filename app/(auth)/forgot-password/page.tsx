"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePasswordReset, usePasswordResetConfirm } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { IconBadge } from "@/components/ui/icon-badge";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 105;

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const resetSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one upper case")
      .regex(/[a-z]/, "At least one lower case")
      .regex(/[^A-Za-z0-9]/, "At least one special character")
      .regex(/[0-9]/, "At least one number"),
    new_password2: z.string(),
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: "Passwords do not match",
    path: ["new_password2"],
  });
type ResetFormValues = z.infer<typeof resetSchema>;

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [email, setEmail] = useState("");

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetFormValues>({ resolver: zodResolver(resetSchema) });

  const passwordReset = usePasswordReset();
  const passwordResetConfirm = usePasswordResetConfirm();

  useEffect(() => {
    if (!otpOpen || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [otpOpen, secondsLeft]);

  const onRequestSubmit = (values: EmailFormValues) => {
    setEmail(values.email);
    passwordReset.mutate(values, {
      onSuccess: () => {
        setOtp("");
        setSecondsLeft(RESEND_SECONDS);
        setOtpOpen(true);
      },
    });
  };

  const onResend = () => {
    if (secondsLeft > 0) return;
    passwordReset.mutate({ email });
    setOtp("");
    setSecondsLeft(RESEND_SECONDS);
  };

  const onValidate = () => {
    setOtpOpen(false);
    setStep("reset");
  };

  const onResetSubmit = (values: ResetFormValues) => {
    passwordResetConfirm.mutate(
      { token: otp, ...values },
      { onSuccess: () => router.push("/login") },
    );
  };

  const newPassword =
    useWatch({ control: resetForm.control, name: "new_password" }) ?? "";

  return (
    <div>
      {step === "request" && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">Forget Password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kindly enter your email so we can send you a password recovery code.
          </p>

          <form
            onSubmit={emailForm.handleSubmit(onRequestSubmit)}
            className="mt-8 flex flex-col gap-5"
          >
            {passwordReset.error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {passwordReset.error.message}
              </p>
            )}
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="Enter your email address"
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register("email")}
            />
            <Button type="submit" loading={passwordReset.isPending}>
              Reset Password
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-semibold text-main hover:underline"
          >
            Go Back to Login
          </Link>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/registration" className="font-medium text-secondary hover:underline">
              Create a free account
            </Link>
          </p>
        </>
      )}

      {step === "reset" && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-500">Please enter your new password.</p>

          <form
            onSubmit={resetForm.handleSubmit(onResetSubmit)}
            className="mt-8 flex flex-col gap-5"
          >
            {passwordResetConfirm.error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {passwordResetConfirm.error.message}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Input
                label="New Password"
                type="password"
                required
                placeholder="Enter your new password"
                error={resetForm.formState.errors.new_password?.message}
                {...resetForm.register("new_password")}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <Input
              label="Confirm New Password"
              type="password"
              required
              placeholder="Confirm your new password"
              error={resetForm.formState.errors.new_password2?.message}
              {...resetForm.register("new_password2")}
            />

            <Button type="submit" loading={passwordResetConfirm.isPending}>
              Create Password
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-semibold text-main hover:underline"
          >
            Go Back to Login
          </Link>
        </>
      )}

      <Modal open={otpOpen} onClose={() => setOtpOpen(false)}>
        <div className="flex flex-col items-center text-center">
          <IconBadge>!</IconBadge>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Enter OTP</h2>
          <p className="mt-1 text-sm text-gray-500">
            Kindly input the OTP sent to your phone number.
          </p>

          <div className="mt-6">
            <OtpInput length={OTP_LENGTH} value={otp} onChange={setOtp} />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Didn&apos;t get a code?{" "}
            {secondsLeft > 0 ? (
              <span className="font-semibold text-gray-700">
                Resend {formatCountdown(secondsLeft)}
              </span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                className="font-semibold text-secondary hover:underline"
              >
                Resend
              </button>
            )}
          </p>

          <div className="mt-6 flex w-full flex-col gap-3">
            <Button type="button" disabled={otp.length !== OTP_LENGTH} onClick={onValidate}>
              Validate
            </Button>
            <button
              type="button"
              onClick={() => setOtpOpen(false)}
              className="w-full rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPasswordPage;
