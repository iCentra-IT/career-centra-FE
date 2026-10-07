"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 bg-gray-50 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <Button
            type="button"
            loading={loading}
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
