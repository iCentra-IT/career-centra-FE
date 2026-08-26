"use client";

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-96 rounded-2xl border border-gray-100 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto px-5 py-6 text-center">
        <p className="text-sm text-gray-400">No notifications API connected yet.</p>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 text-right">
        <button
          type="button"
          disabled
          title="No notifications API available yet"
          className="text-sm font-medium text-gray-300 disabled:cursor-not-allowed"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}
