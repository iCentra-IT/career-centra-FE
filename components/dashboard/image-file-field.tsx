"use client";

import { useEffect, useState } from "react";

interface ImageFileFieldProps {
  label: string;
  existingImageUrl?: string;
  maxBytes?: number;
  // `undefined` = untouched (still showing existingImageUrl if any); `null` = the admin explicitly
  // removed the image (existing or freshly picked) and it should be cleared on save; a `File` =
  // a newly picked replacement.
  file: File | null | undefined;
  onChange: (file: File | null) => void;
}

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024; // 2MB

// A reusable version of the file-picker pattern first built for the program form's cover image:
// real File state (never persisted — browsers block restoring file inputs), an object-URL preview
// that's revoked on replace/unmount, and a fallback to an already-uploaded image when editing.
export function ImageFileField({
  label,
  existingImageUrl,
  maxBytes = DEFAULT_MAX_BYTES,
  file,
  onChange,
}: ImageFileFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after removing it
    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (picked.size > maxBytes) {
      setError(`Image must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller`);
      return;
    }

    setError(undefined);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(picked);
    });
    onChange(picked);
  };

  // Clears whatever is currently shown — a freshly picked file or the already-uploaded image —
  // and tells the parent to drop the image entirely (`null`, distinct from `undefined`/untouched).
  const remove = () => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onChange(null);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shownUrl = preview ?? (file === undefined ? existingImageUrl : undefined);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-900">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-secondary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
      />
      {shownUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shownUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          <button
            type="button"
            onClick={remove}
            className="text-xs font-medium text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ) : (
        file === null && <p className="text-xs text-gray-400">Image will be removed when you save.</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
