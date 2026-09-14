"use client";

import { Modal } from "@/components/ui/modal";

// Structural, not tied to one type — works for both a directory ApprovedFacilitator and a
// program's embedded ProgramFacilitator, which share this same shape.
export interface FacilitatorDetail {
  full_name: string;
  avatar_url: string;
  short_bio: string;
  credential_tags: string[];
}

export function initials(fullName: string) {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function FacilitatorAvatar({
  facilitator,
  className,
}: {
  facilitator: FacilitatorDetail;
  className: string;
}) {
  if (facilitator.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for
      <img src={facilitator.avatar_url} alt={facilitator.full_name} className={`${className} object-cover`} />
    );
  }
  return (
    <div
      className={`${className} flex items-center justify-center bg-secondary/10 font-semibold text-secondary`}
    >
      {initials(facilitator.full_name)}
    </div>
  );
}

export function FacilitatorDetailModal({
  facilitator,
  onClose,
}: {
  facilitator: FacilitatorDetail;
  onClose: () => void;
}) {
  return (
    <Modal open onClose={onClose} size="lg">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
        <FacilitatorAvatar
          facilitator={facilitator}
          className="h-24 w-24 shrink-0 rounded-full text-2xl sm:h-28 sm:w-28"
        />
        <div className="mt-4 min-w-0 sm:mt-0">
          <h3 className="text-lg font-semibold text-gray-900">{facilitator.full_name}</h3>
          {facilitator.credential_tags.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {facilitator.credential_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {facilitator.short_bio && (
            <p className="mt-4 whitespace-pre-line text-sm text-gray-600">{facilitator.short_bio}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
