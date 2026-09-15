"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMyFacilitatorProfile } from "@/hooks/queries/facilitator-profiles";
import { usePatchFacilitatorProfile } from "@/hooks/mutations/facilitator-profiles";
import { TagListField } from "@/components/dashboard/tag-list-field";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/ui/skeleton";
import type { FacilitatorProfile } from "@/types/facilitator";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

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

// The facilitator-specific record (bio, avatar, credentials, public-directory visibility) — a
// different model from the account-level ProfileTab (name/email) shown above it, so this is kept
// as its own section rather than folded into that form.
export function FacilitatorProfileEditor() {
  const { data: profile, isLoading } = useMyFacilitatorProfile();

  if (isLoading) return <FormSkeleton fields={4} />;
  if (!profile) {
    return <p className="text-sm text-gray-400">Facilitator profile not found.</p>;
  }

  return <FacilitatorProfileForm profile={profile} />;
}

// Only mounts once `profile` is loaded, so its editable fields can be initialized straight from
// it (a plain lazy useState) instead of a query-loaded-then-synced-in-an-effect dance.
function FacilitatorProfileForm({ profile }: { profile: FacilitatorProfile }) {
  const patchProfile = usePatchFacilitatorProfile(profile.id);

  const [shortBio, setShortBio] = useState(profile.short_bio);
  const [credentialTags, setCredentialTags] = useState<string[]>(profile.credential_tags);
  const [isPublished, setIsPublished] = useState(profile.is_published);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | undefined>();
  // Distinct from avatarFile being null on its own — tracks that the existing avatar was
  // explicitly cleared, so it should stop showing and the submit payload should send `avatar:
  // null` instead of omitting the field (which would leave the current avatar untouched).
  const [avatarRemoved, setAvatarRemoved] = useState(false);

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
    setAvatarRemoved(false);
  };

  const removeAvatarSelection = () => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarFile(null);
    setAvatarRemoved(true);
  };

  // After a successful save the query refetches with fresh avatar_url, so local override state
  // (preview/removed) should drop back to "untouched" rather than carry over.
  const resetAvatarState = () => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarFile(null);
    setAvatarRemoved(false);
  };

  // Object URLs aren't garbage-collected on their own — release the last one when this unmounts.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    patchProfile.mutate(
      {
        short_bio: shortBio.trim(),
        credential_tags: credentialTags.map((tag) => tag.trim()).filter(Boolean),
        is_published: isPublished,
        avatar: avatarFile ?? (avatarRemoved ? null : undefined),
      },
      {
        onSuccess: () => {
          toast.success("Facilitator profile updated.");
          resetAvatarState();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Public Profile</h2>
      <p className="mt-1 text-sm text-gray-500">
        This is what learners see about you in the public facilitator directory.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Avatar</label>
          <div className="flex items-center gap-4">
            {avatarPreview || (!avatarRemoved && profile.avatar_url) ? (
              // eslint-disable-next-line @next/next/no-img-element -- a blob: preview or an arbitrary hosted URL, next/image can't optimize either
              <img
                src={avatarPreview ?? profile.avatar_url}
                alt={profile.full_name}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <CameraIcon />
              </div>
            )}
            <label className="cursor-pointer rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Change photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            {(avatarPreview || (!avatarRemoved && profile.avatar_url)) && (
              <button
                type="button"
                onClick={removeAvatarSelection}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          {avatarRemoved && !avatarPreview && (
            <p className="text-xs text-gray-400">Avatar will be removed when you save.</p>
          )}
          {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Short Bio</label>
          <textarea
            rows={4}
            placeholder="Tell learners about your background and expertise"
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>

        <TagListField
          label="Credentials"
          addLabel="Add credential"
          values={credentialTags}
          onChange={setCredentialTags}
          required={false}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
          />
          Show my profile in the public facilitator directory
        </label>

        <div className="flex gap-3">
          <Button type="submit" loading={patchProfile.isPending} className="w-auto px-6">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
