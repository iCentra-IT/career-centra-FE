"use client";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M6 7.5v4M10 7.5v4M4 4.5l.6 8a1 1 0 001 .9h4.8a1 1 0 001-.9l.6-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

interface TagListFieldProps {
  label: string;
  addLabel: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  required?: boolean;
}

export function TagListField({
  label,
  addLabel,
  values,
  onChange,
  error,
  required = true,
}: TagListFieldProps) {
  const updateAt = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-900">
        {label} {required && <span className="text-secondary">*</span>}
      </label>

      {values.map((value, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => updateAt(i, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label={`Remove ${label}`}
            className="shrink-0 text-red-500 hover:text-red-600"
          >
            <TrashIcon />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <PlusIcon />
        {addLabel}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
