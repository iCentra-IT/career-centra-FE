"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagListField } from "@/components/dashboard/tag-list-field";
import { FaqListField } from "@/components/dashboard/faq-list-field";
import { ModuleListField, type ModuleFormValue } from "@/components/dashboard/module-list-field";
import { ImageFileField } from "@/components/dashboard/image-file-field";
import type { CreateProgramRequest, PricingMode, ProgramFaq, ProgramResource } from "@/types/programs";
import type { CertificateProvider } from "@/types/cart";

// Confirmed full enum from GET /api/programs/'s program_type filter parameter docs.
const PROGRAM_TYPE_OPTIONS = [
  "Agile, Product & Business Analysis",
  "Career Pathways",
  "Certifications",
  "Consultation-Led Engagement",
  "Corporate Learning",
  "Cybersecurity & Risk",
  "Digital Transformation & AI",
  "Enrollment-Driven Experience",
  "Enterprise Certifications",
  "Executive Education",
  "Innovation & Digital Economy",
  "Leadership Capability",
  "Project & Portfolio Management",
  "Strategic Transformation",
  "Workforce Capability",
];
const LEVEL_OPTIONS = [
  { value: "foundation", label: "Foundation" },
  { value: "professional", label: "Professional" },
  { value: "advanced", label: "Advanced" },
  { value: "specialized", label: "Specialized" },
];
const AUDIENCE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
];
const CERTIFICATE_PROVIDER_OPTIONS: { value: CertificateProvider; label: string }[] = [
  { value: "none", label: "No certificate" },
  { value: "icentra", label: "iCentra" },
  { value: "pmi", label: "PMI" },
  { value: "pecb", label: "PECB" },
];
// Confirmed the only two real values — no ngn_only.
const PRICING_MODE_OPTIONS: { value: PricingMode; label: string }[] = [
  { value: "dual", label: "Dual (USD + NGN)" },
  { value: "usd_only", label: "USD only" },
];

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_BADGE_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_RESOURCE_FILE_BYTES = 20 * 1024 * 1024; // 20MB — course materials can be larger than an image

export interface CertificationFormValue {
  name: string;
  examFormat: string;
  durationMinutes: string;
  delivery: string;
  passRate: string;
}

export interface ProgramFormValues {
  title: string;
  code: string;
  description: string;
  programType: string;
  // Independent accreditation badges — any combination can be on at once.
  pmiBadge: boolean;
  pecbBadge: boolean;
  icentraBadge: boolean;
  // Separate single choice: who actually issues the certificate.
  certificateProvider: CertificateProvider;
  level: string;
  audience: string;
  pricingMode: PricingMode;
  priceUsd: string;
  priceNgn: string;
  learningOutcomes: string[];
  whoShouldAttend: string[];
  prerequisites: string[];
  faqs: ProgramFaq[];
  modules: ModuleFormValue[];
  hasCertification: boolean;
  certification: CertificationFormValue;
  // YouTube video links shown as learner reviews on the program page — plain URLs; ids/timestamps
  // are server-assigned and only exist once read back from GET.
  reviewVideoUrls: string[];
}

interface ProgramFormProps {
  initialValues?: ProgramFormValues;
  // The program's current cover image, if editing one — display-only; a browser can't
  // pre-populate a file input, so a new upload is only sent when the admin picks a new file.
  existingCoverImageUrl?: string;
  existingBadgeImageUrl?: string;
  // Resource files already uploaded, if editing one — display-only, same reasoning as above.
  existingResources?: ProgramResource[];
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: CreateProgramRequest) => void;
  onClose: () => void;
}

export const EMPTY_CERTIFICATION: CertificationFormValue = {
  name: "",
  examFormat: "",
  durationMinutes: "",
  delivery: "",
  passRate: "",
};

const EMPTY_VALUES: ProgramFormValues = {
  title: "",
  code: "",
  description: "",
  programType: "",
  pmiBadge: false,
  pecbBadge: false,
  icentraBadge: false,
  certificateProvider: "none",
  level: "",
  audience: "individual",
  pricingMode: "dual",
  priceUsd: "",
  priceNgn: "",
  learningOutcomes: [],
  whoShouldAttend: [],
  prerequisites: [],
  faqs: [],
  modules: [],
  hasCertification: false,
  certification: EMPTY_CERTIFICATION,
  reviewVideoUrls: [],
};

export function ProgramForm({
  initialValues,
  existingCoverImageUrl,
  existingBadgeImageUrl,
  existingResources,
  submitLabel,
  isPending,
  onSubmit,
  onClose,
}: ProgramFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [title, setTitle] = useState(initialValues?.title ?? EMPTY_VALUES.title);
  const [code, setCode] = useState(initialValues?.code ?? EMPTY_VALUES.code);
  const [description, setDescription] = useState(
    initialValues?.description ?? EMPTY_VALUES.description,
  );
  const [programType, setProgramType] = useState(
    initialValues?.programType ?? EMPTY_VALUES.programType,
  );
  const [pmiBadge, setPmiBadge] = useState(initialValues?.pmiBadge ?? EMPTY_VALUES.pmiBadge);
  const [pecbBadge, setPecbBadge] = useState(initialValues?.pecbBadge ?? EMPTY_VALUES.pecbBadge);
  const [icentraBadge, setIcentraBadge] = useState(
    initialValues?.icentraBadge ?? EMPTY_VALUES.icentraBadge,
  );
  const [certificateProvider, setCertificateProvider] = useState<CertificateProvider>(
    initialValues?.certificateProvider ?? EMPTY_VALUES.certificateProvider,
  );
  const [level, setLevel] = useState(initialValues?.level ?? EMPTY_VALUES.level);
  const [audience, setAudience] = useState(initialValues?.audience ?? EMPTY_VALUES.audience);
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    initialValues?.pricingMode ?? EMPTY_VALUES.pricingMode,
  );
  const [priceUsd, setPriceUsd] = useState(initialValues?.priceUsd ?? EMPTY_VALUES.priceUsd);
  const [priceNgn, setPriceNgn] = useState(initialValues?.priceNgn ?? EMPTY_VALUES.priceNgn);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  // Distinct from coverImageFile being null on its own (which just means "no new file picked
  // yet") — this tracks that the admin explicitly cleared the already-uploaded image, so the
  // existing preview should stop showing and the submit payload should send `cover_image: null`
  // instead of omitting the field (which would leave the old image untouched).
  const [coverImageRemoved, setCoverImageRemoved] = useState(false);
  const [errors1, setErrors1] = useState<Record<string, string>>({});

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after removing it
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors1((prev) => ({ ...prev, coverImage: "Please choose an image file" }));
      return;
    }
    if (file.size > MAX_COVER_IMAGE_BYTES) {
      setErrors1((prev) => ({ ...prev, coverImage: "Image must be 2MB or smaller" }));
      return;
    }

    setErrors1((prev) => {
      const next = { ...prev };
      delete next.coverImage;
      return next;
    });

    setCoverImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCoverImageFile(file);
    setCoverImageRemoved(false);
  };

  const removeCoverImage = () => {
    setCoverImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCoverImageFile(null);
    setCoverImageRemoved(true);
  };

  const [badgeImageFile, setBadgeImageFile] = useState<File | null | undefined>(undefined);

  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [resourceErrors, setResourceErrors] = useState<string | undefined>();

  const handleResourceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting after removing one
    if (picked.length === 0) return;

    const tooLarge = picked.find((f) => f.size > MAX_RESOURCE_FILE_BYTES);
    if (tooLarge) {
      setResourceErrors(`"${tooLarge.name}" is over 20MB`);
      return;
    }

    setResourceErrors(undefined);
    setResourceFiles((prev) => [...prev, ...picked]);
  };

  const removeResourceFile = (index: number) => {
    setResourceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Object URLs aren't garbage-collected on their own — release the last one when the form goes away.
  useEffect(() => {
    return () => {
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [modules, setModules] = useState(initialValues?.modules ?? EMPTY_VALUES.modules);
  const [hasCertification, setHasCertification] = useState(
    initialValues?.hasCertification ?? EMPTY_VALUES.hasCertification,
  );
  const [certification, setCertification] = useState(
    initialValues?.certification ?? EMPTY_VALUES.certification,
  );
  const [reviewVideoUrls, setReviewVideoUrls] = useState(
    initialValues?.reviewVideoUrls ?? EMPTY_VALUES.reviewVideoUrls,
  );
  const [errors2, setErrors2] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Course name is required";
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
    if (hasCertification && !certification.name.trim())
      next.certification = "Enter a certification name, or turn this off";
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
      pricing_mode: pricingMode,
      base_price_usd: priceUsd,
      base_price_ngn: priceNgn || "0",
      has_pmi_badge: pmiBadge,
      has_pecb_badge: pecbBadge,
      has_icentra_badge: icentraBadge,
      certificate_provider: certificateProvider,
      cover_image: coverImageFile ?? (coverImageRemoved ? null : undefined),
      badge_image: badgeImageFile,
      resources: resourceFiles.length > 0 ? resourceFiles : undefined,
      learning_outcomes: learningOutcomes.map((v) => v.trim()).filter(Boolean),
      who_should_attend: whoShouldAttend.map((v) => v.trim()).filter(Boolean),
      prerequisites: prerequisites
        .map((v) => v.trim())
        .filter(Boolean)
        .map((text, i) => ({ kind: "required" as const, text, order: i + 1 })),
      faqs: faqs.filter((f) => f.question.trim()),
      modules: modules
        .filter((m) => m.title.trim())
        .map((m, i) => ({
          title: m.title.trim(),
          order: i + 1,
          lessons: m.lessons
            .filter((l) => l.title.trim())
            .map((l, li) => ({ title: l.title.trim(), order: li + 1 })),
        })),
      certification:
        hasCertification && certification.name.trim()
          ? {
              name: certification.name.trim(),
              exam_format: certification.examFormat.trim(),
              duration_minutes: Number(certification.durationMinutes) || 0,
              delivery: certification.delivery.trim(),
              pass_rate: certification.passRate.trim(),
            }
          : null,
      reviews: reviewVideoUrls
        .map((v) => v.trim())
        .filter(Boolean)
        .map((video_url) => ({ video_url })),
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
            // required
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
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-secondary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
            />
            {coverImagePreview ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- a blob: object URL, next/image can't optimize it anyway */}
                <img
                  src={coverImagePreview}
                  alt="New cover preview"
                  className="h-16 w-24 rounded-md border border-gray-100 object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              existingCoverImageUrl &&
              !coverImageRemoved && (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for */}
                  <img
                    src={existingCoverImageUrl}
                    alt="Current cover"
                    className="h-16 w-24 rounded-md border border-gray-100 object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-400">Current image — pick a new file to replace it.</p>
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="self-start text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
            {coverImageRemoved && !coverImagePreview && (
              <p className="text-xs text-gray-400">Cover image will be removed when you save.</p>
            )}
            {errors1.coverImage && <p className="text-xs text-red-500">{errors1.coverImage}</p>}
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Badge Image</p>
              <p className="text-xs text-gray-400">
                A custom accreditation seal (e.g. the real PMI/PECB artwork) shown on the program page —
                separate from the Accreditation Badges checkboxes below.
              </p>
            </div>
            <ImageFileField
              label="Upload Badge Image"
              existingImageUrl={existingBadgeImageUrl}
              maxBytes={MAX_BADGE_IMAGE_BYTES}
              file={badgeImageFile}
              onChange={setBadgeImageFile}
            />
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
            <label className="text-sm text-gray-900">Accreditation Badges</label>
            <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={pmiBadge}
                  onChange={(e) => setPmiBadge(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                PMI Authorized
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={pecbBadge}
                  onChange={(e) => setPecbBadge(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                PECB Authorized
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={icentraBadge}
                  onChange={(e) => setIcentraBadge(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                iCentra Authorized
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Certificate Provider</label>
            <select
              value={certificateProvider}
              onChange={(e) => setCertificateProvider(e.target.value as CertificateProvider)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              {CERTIFICATE_PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Who issues the certificate learners receive — separate from the badges above.</p>
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
              disabled
              title="Audience switching isn't available yet — new programs are individual-only for now"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
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

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Pricing Mode</label>
            <select
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as PricingMode)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              {PRICING_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
              title="Programs don't have a facilitator field. Facilitators are assigned per cohort."
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
          <ModuleListField values={modules} onChange={setModules} />

          <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
            <label className="flex items-center gap-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={hasCertification}
                onChange={(e) => setHasCertification(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              This program includes a certification exam
            </label>

            {hasCertification && (
              <div className="flex flex-col gap-3">
                <input
                  value={certification.name}
                  onChange={(e) => setCertification({ ...certification, name: e.target.value })}
                  placeholder="Certification name"
                  className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={certification.examFormat}
                    onChange={(e) =>
                      setCertification({ ...certification, examFormat: e.target.value })
                    }
                    placeholder="Exam format (e.g. Multiple choice)"
                    className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                  <input
                    value={certification.durationMinutes}
                    onChange={(e) =>
                      setCertification({ ...certification, durationMinutes: e.target.value })
                    }
                    type="number"
                    placeholder="Duration (minutes)"
                    className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={certification.delivery}
                    onChange={(e) => setCertification({ ...certification, delivery: e.target.value })}
                    placeholder="Delivery (e.g. Online proctored)"
                    className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                  <input
                    value={certification.passRate}
                    onChange={(e) => setCertification({ ...certification, passRate: e.target.value })}
                    placeholder="Pass rate (e.g. 92%)"
                    className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>
            )}
            {errors2.certification && <p className="text-xs text-red-500">{errors2.certification}</p>}
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Learner Reviews</p>
              <p className="text-xs text-gray-400">
                Paste YouTube video links (e.g. https://youtu.be/xxxx or https://www.youtube.com/watch?v=xxxx) —
                they show under the &quot;Testimonials&quot; tab on the program page and play inline, so
                learners won&apos;t need to leave the site.
              </p>
            </div>
            <TagListField
              label="Review Videos (YouTube links)"
              addLabel="Add Video Link"
              values={reviewVideoUrls}
              onChange={setReviewVideoUrls}
              required={false}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Course Resources</p>
              <p className="text-xs text-gray-400">
                Upload downloadable files (slides, worksheets, etc.) — enrolled learners can download
                these from their course page.
              </p>
            </div>

            {existingResources && existingResources.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">Already uploaded</p>
                {existingResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-secondary hover:underline"
                  >
                    {resource.title}
                  </a>
                ))}
              </div>
            )}

            <input
              type="file"
              multiple
              onChange={handleResourceFilesChange}
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-secondary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
            />
            {resourceFiles.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {resourceFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeResourceFile(i)}
                      className="shrink-0 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {resourceErrors && <p className="text-xs text-red-500">{resourceErrors}</p>}
          </div>

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
