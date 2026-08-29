"use client";

import type { ProgramFaq } from "@/types/programs";

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

interface FaqListFieldProps {
  values: ProgramFaq[];
  onChange: (values: ProgramFaq[]) => void;
  error?: string;
}

export function FaqListField({ values, onChange, error }: FaqListFieldProps) {
  const updateAt = (index: number, field: keyof ProgramFaq, value: string) => {
    const next = [...values];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-900">
        Frequently Asked Questions <span className="text-secondary">*</span>
      </label>

      {values.map((faq, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <input
              value={faq.question}
              onChange={(e) => updateAt(i, "question", e.target.value)}
              placeholder="Question"
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove FAQ"
              className="shrink-0 text-red-500 hover:text-red-600"
            >
              <TrashIcon />
            </button>
          </div>
          <textarea
            rows={2}
            value={faq.answer}
            onChange={(e) => updateAt(i, "answer", e.target.value)}
            placeholder="Answer"
            className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...values, { question: "", answer: "" }])}
        className="flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <PlusIcon />
        Add Point
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
