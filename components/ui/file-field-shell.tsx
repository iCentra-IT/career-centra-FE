import type { ReactNode } from "react";

// A plain `<input type="file">` renders as just the OS picker button with nothing around it, so
// next to bordered text inputs/textareas it reads as a loose, unstyled gap in the form. This wraps
// any file field (label + input + optional existing-file preview) in the same bordered box the
// rest of the form uses, so file fields stop looking like an afterthought.
export function FileFieldShell({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-900">
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
        {children}
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
