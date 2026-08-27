"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProfile } from "@/hooks/queries/auth";
import { usePatchProfile } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M4 7.5A1.5 1.5 0 015.5 6h1.8l.9-1.5h5.6L14.7 6h1.8A1.5 1.5 0 0118 7.5v8A1.5 1.5 0 0116.5 17h-11A1.5 1.5 0 014 15.5v-8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="11.5" r="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const patchProfile = usePatchProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: "", last_name: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ first_name: profile.first_name, last_name: profile.last_name });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileFormValues) =>
    patchProfile.mutate(values, {
      onSuccess: () => toast.success("Profile updated."),
      onError: (err) => toast.error(err.message),
    });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
      <p className="mt-1 text-sm text-gray-500">Keep your profile up to date</p>

      <button
        type="button"
        disabled
        title="Avatar upload not available yet"
        className="mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400"
      >
        <CameraIcon />
      </button>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 flex max-w-md flex-col gap-5"
      >
        <Input
          label="First Name"
          required
          placeholder="Enter first name"
          disabled={isLoading}
          error={form.formState.errors.first_name?.message}
          {...form.register("first_name")}
        />
        <Input
          label="Last Name"
          required
          placeholder="Enter last name"
          disabled={isLoading}
          error={form.formState.errors.last_name?.message}
          {...form.register("last_name")}
        />
        <Input
          label="Email Address"
          required
          disabled
          value={profile?.email ?? ""}
          readOnly
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Timezone</label>
          <select
            disabled
            title="Not available yet"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-500 disabled:cursor-not-allowed"
          >
            <option>GMT +1 West African Time</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Language</label>
          <select
            disabled
            title="Not available yet"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-500 disabled:cursor-not-allowed"
          >
            <option>English, UK</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={patchProfile.isPending} className="w-auto px-6">
            Save
          </Button>
          <button
            type="button"
            onClick={() =>
              profile && form.reset({ first_name: profile.first_name, last_name: profile.last_name })
            }
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
}
