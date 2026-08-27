"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useChangePassword } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { IconBadge } from "@/components/ui/icon-badge";
import type { ChangePasswordRequest } from "@/types/auth";

const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "At least 8 characters"),
    new_password2: z.string(),
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: "Passwords do not match",
    path: ["new_password2"],
  });
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M6.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SecurityMenu({ onChangePassword }: { onChangePassword: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Security</h2>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        Your security is our priority. Kindly make sure you can always access your account by
        keeping this information up to date.
      </p>

      <div className="mt-6 max-w-2xl divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        <button
          type="button"
          onClick={onChangePassword}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">Change Password</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Update your password to maintain the security of your account.
            </p>
          </div>
          <ChevronIcon />
        </button>
        <div
          className="flex w-full cursor-not-allowed items-center justify-between px-5 py-4 text-left opacity-60"
          title="Not available yet"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">2 Factor Authentication</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Add an extra layer of security to your account by enabling two-factor
              authentication.
            </p>
          </div>
          <ChevronIcon />
        </div>
      </div>
    </div>
  );
}

export function SecurityTab() {
  const [view, setView] = useState<"menu" | "change-password">("menu");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ChangePasswordRequest | null>(null);

  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = (values: ChangePasswordValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const onConfirm = () => {
    if (!pendingValues) return;
    changePassword.mutate(pendingValues, {
      onSuccess: () => {
        setConfirmOpen(false);
        setSuccessOpen(true);
        form.reset();
      },
      onError: (err) => {
        setConfirmOpen(false);
        toast.error(err.message);
      },
    });
  };

  const onDone = () => {
    setSuccessOpen(false);
    setView("menu");
  };

  if (view === "menu") {
    return <SecurityMenu onChangePassword={() => setView("change-password")} />;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500">
        Please enter your current password to change your password
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex max-w-md flex-col gap-5">
        <Input
          label="Current Password"
          type="password"
          required
          placeholder="Enter your password"
          error={form.formState.errors.old_password?.message}
          {...form.register("old_password")}
        />
        <Input
          label="New Password"
          type="password"
          required
          placeholder="Enter your new password"
          error={form.formState.errors.new_password?.message}
          {...form.register("new_password")}
        />
        <Input
          label="Confirm New Password"
          type="password"
          required
          placeholder="Confirm your new password"
          error={form.formState.errors.new_password2?.message}
          {...form.register("new_password2")}
        />

        <div className="flex gap-3">
          <Button type="submit" className="w-auto px-6">
            Save Settings
          </Button>
          <button
            type="button"
            onClick={() => setView("menu")}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </form>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="flex flex-col items-center text-center">
          <IconBadge>!</IconBadge>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Change Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            Are you sure you want to change your password?
          </p>
          <div className="mt-6 flex w-full flex-col gap-3">
            <Button type="button" loading={changePassword.isPending} onClick={onConfirm}>
              Yes
            </Button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="w-full rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={successOpen} onClose={onDone}>
        <div className="flex flex-col items-center text-center">
          <IconBadge>✓</IconBadge>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Password Changed</h2>
          <p className="mt-1 text-sm text-gray-500">
            You have successfully changed your password.
          </p>
          <div className="mt-6 w-full">
            <Button type="button" onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
