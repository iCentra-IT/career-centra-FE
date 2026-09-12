"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagListField } from "@/components/dashboard/tag-list-field";
import { useApprovedFacilitators } from "@/hooks/queries/facilitator-profiles";
import { useCreateFacilitatorApplication } from "@/hooks/mutations/facilitator-applications";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import type { CreateFacilitatorApplicationRequest } from "@/types/facilitator";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB — matches the backend's documented cv_file limit

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="#0c236c" strokeWidth="1.3" />
      <path d="M5 8.2l2 2 4-4.4" stroke="#0c236c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 13V3m0 0L6 7m4-4l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 13v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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

function FacilitatorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="9.5" r="4.5" stroke="#0c236c" strokeWidth="1.6" />
      <path
        d="M6 23c1.6-4.6 4.7-7 8-7s6.4 2.4 8 7"
        stroke="#0c236c"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const REASONS = [
  "Flexible, cohort-based delivery",
  "Competitive facilitator compensation",
  "Global learner community",
  "Ongoing accreditation support",
];

const applicationSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  linkedin_url: z.string().min(1, "LinkedIn URL is required").url("Enter a valid URL"),
  experience_years: z.coerce.number().min(0, "Years of experience is required"),
  motivation_statement: z.string().min(1, "Motivation statement is required"),
});
type ApplicationFormValues = z.infer<typeof applicationSchema>;

const FacilitatorPage = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | undefined>();
  const [domainAreas, setDomainAreas] = useState<string[]>([""]);
  const [certificationsHeld, setCertificationsHeld] = useState<string[]>([""]);
  const [domainAreasError, setDomainAreasError] = useState<string | undefined>();
  const [certificationsError, setCertificationsError] = useState<string | undefined>();
  const { data: facilitators, isLoading: facilitatorsLoading } = useApprovedFacilitators();
  const createApplication = useCreateFacilitatorApplication();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after removing it
    if (!file) return;
    if (file.size > MAX_CV_BYTES) {
      setCvError("File must be 5MB or smaller");
      return;
    }
    setCvError(undefined);
    setCvFile(file);
  };

  const onSubmit = (values: ApplicationFormValues) => {
    const domains = domainAreas.map((v) => v.trim()).filter(Boolean);
    const certifications = certificationsHeld.map((v) => v.trim()).filter(Boolean);

    let valid = true;
    if (!cvFile) {
      setCvError("Resume/CV is required");
      valid = false;
    }
    if (domains.length === 0) {
      setDomainAreasError("Add at least one specialised domain");
      valid = false;
    }
    if (certifications.length === 0) {
      setCertificationsError("Add at least one credential");
      valid = false;
    }
    if (!valid || !cvFile) return;

    const payload: CreateFacilitatorApplicationRequest = {
      ...values,
      domain_areas: domains,
      certifications_held: certifications,
      cv_file: cvFile,
    };

    createApplication.mutate(payload, {
      onSuccess: () => {
        toast.success("Application submitted — we'll be in touch after review.");
        reset();
        setCvFile(null);
        setDomainAreas([""]);
        setCertificationsHeld([""]);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div>
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              Our facilitators
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Certified experts who&apos;ve done the work
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Every program is led by practitioners with deep credentials and real delivery
              experience.
            </p>
            <button
              type="button"
              onClick={scrollToForm}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Become a Facilitator →
            </button>
          </div>
          <div className="hidden aspect-4/3 overflow-hidden rounded-2xl lg:block">
            <Image
              src="/hero-page.png"
              alt="Facilitator mentoring a learner"
              width={600}
              height={450}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Our Facilitators</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Meet Your Facilitators</h2>

        {facilitatorsLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CardGridSkeleton count={4} />
          </div>
        ) : (facilitators ?? []).length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
            <FacilitatorIcon />
            <p className="text-sm text-gray-500">No facilitator profiles published yet.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {facilitators?.map((facilitator) => (
              <div
                key={facilitator.id}
                className="flex gap-4 rounded-2xl border border-gray-100 p-5"
              >
                {facilitator.avatar_url ? (
                  <img
                    src={facilitator.avatar_url}
                    alt={facilitator.full_name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary">
                    {facilitator.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{facilitator.full_name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{facilitator.short_bio}</p>
                  {facilitator.credential_tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section ref={formRef} className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Why Teach With Us</p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">
              A rewarding facilitator partnership
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {REASONS.map((reason) => (
                <li key={reason} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckIcon />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input label="Full Name" placeholder="Jane Smith" error={errors.full_name?.message} {...register("full_name")} />
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@company.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Phone"
                required
                placeholder="+234 800 000 0000"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input
                label="LinkedIn URL"
                required
                placeholder="linkedin.com/in/jane"
                error={errors.linkedin_url?.message}
                {...register("linkedin_url")}
              />
            </div>

            <Input
              label="Years of Experience"
              type="number"
              min={0}
              required
              placeholder="e.g. 5"
              error={errors.experience_years?.message}
              {...register("experience_years")}
            />

            <TagListField
              label="Specialised Domains"
              addLabel="Add domain"
              values={domainAreas}
              onChange={(v) => {
                setDomainAreas(v);
                setDomainAreasError(undefined);
              }}
              error={domainAreasError}
            />
            <TagListField
              label="Active Credentials"
              addLabel="Add credential"
              values={certificationsHeld}
              onChange={(v) => {
                setCertificationsHeld(v);
                setCertificationsError(undefined);
              }}
              error={certificationsError}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">
                Motivation Statement <span className="text-secondary">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your learning needs and goals..."
                className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                {...register("motivation_statement")}
              />
              {errors.motivation_statement && (
                <p className="text-xs text-red-500">{errors.motivation_statement.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-900">
                Upload your Resume and Cover Letter <span className="text-secondary">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleCvChange}
              />
              {cvFile ? (
                <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <span className="truncate">{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCvFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label="Remove file"
                    className="shrink-0 text-red-500 hover:text-red-600"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 hover:bg-gray-100"
                >
                  <UploadIcon />
                  Click <span className="font-medium text-gray-700">here</span> to upload your supporting document
                </button>
              )}
              {cvError ? (
                <p className="text-xs text-red-500">{cvError}</p>
              ) : (
                !cvFile && <p className="text-xs text-gray-400">Resume/CV is required (PDF or Word, max 5MB).</p>
              )}
            </div>

            <Button type="submit" loading={createApplication.isPending} className="mt-1">
              Submit Application
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorPage;
