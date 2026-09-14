"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useProfile } from "@/hooks/queries/auth";
import { usePatchProfile } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | undefined>();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: "", last_name: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ first_name: profile.first_name, last_name: profile.last_name });
    }
  }, [profile, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after removing it
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 2MB or smaller");
      return;
    }

    setAvatarError(undefined);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAvatarFile(file);
  };

  const removeAvatarSelection = () => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarFile(null);
  };

  // Object URLs aren't garbage-collected on their own — release the last one when this unmounts.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: ProfileFormValues) =>
    patchProfile.mutate(
      { ...values, avatar: avatarFile ?? undefined },
      {
        onSuccess: () => {
          toast.success("Profile updated.");
          removeAvatarSelection();
        },
        onError: (err) => toast.error(err.message),
      },
    );

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
      <p className="mt-1 text-sm text-gray-500">Keep your profile up to date</p>

      <div className="mt-6 flex items-center gap-4">
        {avatarPreview || profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- a blob: preview or an arbitrary hosted URL, next/image can't optimize either
          <img
            src={avatarPreview ?? profile?.avatar_url}
            alt={profile?.full_name ?? "Avatar"}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <CameraIcon />
          </div>
        )}
        <label className="cursor-pointer rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          Change photo
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>
        {avatarPreview && (
          <button
            type="button"
            onClick={removeAvatarSelection}
            className="text-xs font-medium text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>
      {avatarError && <p className="mt-2 text-xs text-red-500">{avatarError}</p>}

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
            onClick={() => {
              removeAvatarSelection();
              if (profile) form.reset({ first_name: profile.first_name, last_name: profile.last_name });
            }}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
}
