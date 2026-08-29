"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagListField } from "@/components/dashboard/tag-list-field";
import { FaqListField } from "@/components/dashboard/faq-list-field";
import type { CreateProgramRequest, ProgramFaq } from "@/types/programs";

const PROGRAM_TYPE_OPTIONS = [
  "Project & Portfolio Management",
  "Agile, Product & Business Analysis",
  "Cybersecurity & Risk",
  "AI & Digital Transformation",
  "Workforce Capability",
];
const LEVEL_OPTIONS = [
  { value: "foundation", label: "Foundation" },
  { value: "professional", label: "Professional" },
  { value: "advanced", label: "Advanced" },
];
const AUDIENCE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
];
const BADGE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "pmi", label: "PMI Authorized" },
  { value: "pecb", label: "PECB Authorized" },
];

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export interface ProgramFormValues {
  title: string;
  code: string;
  description: string;
  programType: string;
  badge: "none" | "pmi" | "pecb";
  level: string;
  audience: string;
  priceUsd: string;
  priceNgn: string;
  learningOutcomes: string[];
  whoShouldAttend: string[];
  prerequisites: string[];
  faqs: ProgramFaq[];
}

interface ProgramFormProps {
  initialValues?: ProgramFormValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: CreateProgramRequest) => void;
  onClose: () => void;
}

const EMPTY_VALUES: ProgramFormValues = {
  title: "",
  code: "",
  description: "",
  programType: "",
  badge: "none",
  level: "",
  audience: "",
  priceUsd: "",
  priceNgn: "",
  learningOutcomes: [],
  whoShouldAttend: [],
  prerequisites: [],
  faqs: [],
};

export function ProgramForm({
  initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onClose,
}: ProgramFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [title, setTitle] = useState(initialValues?.title ?? EMPTY_VALUES.title);
  const [code, setCode] = useState(initialValues?.code ?? EMPTY_VALUES.code);
  const [description, setDescription] = useState(initialValues?.description ?? EMPTY_VALUES.description);
  const [programType, setProgramType] = useState(initialValues?.programType ?? EMPTY_VALUES.programType);
  const [badge, setBadge] = useState(initialValues?.badge ?? EMPTY_VALUES.badge);
  const [level, setLevel] = useState(initialValues?.level ?? EMPTY_VALUES.level);
  const [audience, setAudience] = useState(initialValues?.audience ?? EMPTY_VALUES.audience);
  const [priceUsd, setPriceUsd] = useState(initialValues?.priceUsd ?? EMPTY_VALUES.priceUsd);
  const [priceNgn, setPriceNgn] = useState(initialValues?.priceNgn ?? EMPTY_VALUES.priceNgn);
  const [errors1, setErrors1] = useState<Record<string, string>>({});

  const [learningOutcomes, setLearningOutcomes] = useState(
    initialValues?.learningOutcomes ?? EMPTY_VALUES.learningOutcomes,
  );
  const [whoShouldAttend, setWhoShouldAttend] = useState(
    initialValues?.whoShouldAttend ?? EMPTY_VALUES.whoShouldAttend,
  );
  const [prerequisites, setPrerequisites] = useState(
    initialValues?.prerequisites ?? EMPTY_VALUES.prerequisites,
  );
  const [faqs, setFaqs] = useState(initialValues?.faqs ?? EMPTY_VALUES.faqs);
  const [reviewPoints, setReviewPoints] = useState<string[]>([]);
  const [errors2, setErrors2] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Course name is required";
    if (!code.trim()) next.code = "Program code is required";
    if (!programType) next.programType = "Program type is required";
    if (!level) next.level = "Course level is required";
    if (!audience) next.audience = "Audience is required";
    if (!priceUsd.trim()) next.priceUsd = "USD price is required";
    setErrors1(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (learningOutcomes.filter((v) => v.trim()).length === 0)
      next.learningOutcomes = "Add at least one learning outcome";
    if (whoShouldAttend.filter((v) => v.trim()).length === 0)
      next.whoShouldAttend = "Add at least one point";
    if (prerequisites.filter((v) => v.trim()).length === 0)
      next.prerequisites = "Add at least one prerequisite";
    if (faqs.filter((f) => f.question.trim()).length === 0) next.faqs = "Add at least one FAQ";
    setErrors2(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    onSubmit({
      title: title.trim(),
      code: code.trim(),
      program_type: programType,
      level,
      audience,
      purchase_mode: "direct",
      summary: description.trim(),
      outline: description.trim(),
      base_price_usd: priceUsd,
      base_price_ngn: priceNgn || "0",
      has_pmi_badge: badge === "pmi",
      has_pecb_badge: badge === "pecb",
      learning_outcomes: learningOutcomes.map((v) => v.trim()).filter(Boolean),
      who_should_attend: whoShouldAttend.map((v) => v.trim()).filter(Boolean),
      prerequisites: prerequisites
        .map((v) => v.trim())
        .filter(Boolean)
        .map((text, i) => ({ kind: "required" as const, text, order: i + 1 })),
      faqs: faqs.filter((f) => f.question.trim()),
      is_active: true,
    });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      {step === 1 ? (
        <>
          <Input
            label="Course Name"
            required
            placeholder="Enter course name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors1.title}
          />

          <Input
            label="Program Code"
            required
            placeholder="e.g. PMP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors1.code}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Description</label>
            <textarea
              rows={4}
              maxLength={600}
              placeholder="Enter a brief description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <p className="text-xs text-gray-400">Max Character: 600 words</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Cover Image</label>
            <button
              type="button"
              disabled
              title="Image upload isn't available yet"
              className="flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-400 disabled:cursor-not-allowed"
            >
              <PlusIcon />
              Add Cover image
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Program Type <span className="text-secondary">*</span>
            </label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              <option value="">Select program type</option>
              {PROGRAM_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors1.programType && <p className="text-xs text-red-500">{errors1.programType}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Course Badge</label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value as ProgramFormValues["badge"])}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              {BADGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Course Level <span className="text-secondary">*</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              <option value="">Select level</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors1.level && <p className="text-xs text-red-500">{errors1.level}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Audiences <span className="text-secondary">*</span>
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              <option value="">Select Audience type</option>
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors1.audience && <p className="text-xs text-red-500">{errors1.audience}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (USD)"
              required
              type="number"
              step="0.01"
              placeholder="$0.00"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              error={errors1.priceUsd}
            />
            <Input
              label="Price (NGN)"
              type="number"
              step="0.01"
              placeholder="₦0.00"
              value={priceNgn}
              onChange={(e) => setPriceNgn(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Facilitator</label>
            <select
              disabled
              title="Programs don't have a facilitator field — facilitators are assigned per cohort"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option>Select facilitator</option>
            </select>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <Button type="button" onClick={goNext} className="w-auto px-6">
              Next
            </Button>
          </div>
        </>
      ) : (
        <>
          <TagListField
            label="Learning Outcome"
            addLabel="Add Point"
            values={learningOutcomes}
            onChange={setLearningOutcomes}
            error={errors2.learningOutcomes}
          />
          <TagListField
            label="Who Should Attend"
            addLabel="Add Point"
            values={whoShouldAttend}
            onChange={setWhoShouldAttend}
            error={errors2.whoShouldAttend}
          />
          <TagListField
            label="Prerequisites"
            addLabel="Add Point"
            values={prerequisites}
            onChange={setPrerequisites}
            error={errors2.prerequisites}
          />
          <FaqListField values={faqs} onChange={setFaqs} error={errors2.faqs} />
          <TagListField
            label="Review"
            addLabel="Add Point"
            values={reviewPoints}
            onChange={setReviewPoints}
            required={false}
          />

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <Button type="button" loading={isPending} onClick={handleSubmit} className="w-auto px-6">
              {submitLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
