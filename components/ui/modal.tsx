"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  // "sm" (default) matches every existing form/confirm modal in the dashboard — kept as the
  // default so this stays a no-op for them. "lg" is for content-heavy modals (e.g. a facilitator's
  // full details) that read as cramped at max-w-sm on a desktop screen. "xl" is for side-by-side
  // two-column layouts (e.g. description + form), which need more width than a single column.
  size?: "sm" | "lg" | "xl";
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  children,
  footer,
  size = "sm",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Portaled to document.body rather than rendered inline — otherwise any ancestor with overflow
  // other than visible, a transform, a filter, or similar clips or repositions this even though
  // it's `position: fixed`, since that ancestor becomes the containing block (or, for plain
  // overflow: hidden, some browsers still clip fixed descendants as a quirk). A portal makes the
  // modal's behavior independent of wherever it happens to be mounted in the tree.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 motion-safe:animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex max-h-[90vh] w-full ${SIZE_CLASSES[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-lg motion-safe:animate-modal-in`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition hover:bg-gray-50 hover:text-gray-900"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
