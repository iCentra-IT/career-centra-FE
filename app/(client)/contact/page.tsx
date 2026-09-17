"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateLead } from "@/hooks/mutations/leads";
import type { CreateLeadRequest } from "@/types/lead";
import { Input } from "@/components/ui/input";

// TODO: replace with the real WhatsApp business number, digits only with country code (no "+",
// spaces or dashes) — e.g. "2348000000000" for a Nigerian +234 800 000 0000 number.
const WHATSAPP_NUMBER = "REPLACE_WITH_WHATSAPP_NUMBER";

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8.5h16M7 2.5v4M15 2.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 3.5a7.5 7.5 0 00-6.4 11.4L3.5 18.5l3.7-1.1A7.5 7.5 0 1011 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 8.8c.1-.6.6-1 1.1-1 .3 0 .5.1.7.6l.4 1c.1.3 0 .5-.2.7l-.4.4c.4.9 1.1 1.6 2 2l.4-.4c.2-.2.4-.3.7-.2l1 .4c.5.2.6.4.6.7 0 .5-.4 1-1 1.1-1.3.3-3.3-.8-4.5-2-1.2-1.2-2.3-3.2-2-4.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// const SUPPORT_TYPES = [
//   {
//     title: "Individual Learning Support",
//     description: "Get help selecting the right certification track and learning pathway.",
//     audienceType: "individual" as const,
//   },
//   {
//     title: "Enterprise Learning Consultation",
//     description: "Discuss workforce capability, corporate programs, and enterprise learning solutions.",
//     audienceType: "corporate" as const,
//   },
//   {
//     title: "Executive Programs Advisory",
//     description: "Learn more about leadership and executive learning opportunities.",
//     audienceType: "individual" as const,
//   },
// ];

const inquirySchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  audience_type: z.enum(["individual", "corporate"]),
  message: z.string().min(1, "Please share a few details about what you need"),
});
type InquiryFormValues = z.infer<typeof inquirySchema>;

const ContactPage = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    // setValue,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { audience_type: "individual" },
  });

  const onSubmit = (values: InquiryFormValues) => {
    const payload: CreateLeadRequest = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      audience_type: values.audience_type,
      platform: "careercentra",
      intent_tier: "medium",
      message: values.message,
    };

    createLead.mutate(payload, {
      onSuccess: () => {
        toast.success("Thanks! We'll be in touch shortly.");
        setSubmitted(true);
        reset({ audience_type: "individual" });
      },
      onError: (err) => toast.error(err.message),
    });
  };

  // const selectSupportType = (audienceType: "individual" | "corporate") => {
  //   setValue("audience_type", audienceType);
  //   formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  // };

  return (
    <div className="space-y-10">
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            Learning Support &amp; Advisory
          </span>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Let&apos;s Find the Right Path for You</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Whether you&apos;re looking to advance your career, develop as a leader, or build
            capability across your organisation, choose the type of support you need and connect
            with the iCentra Learning team.
          </p>
        </div>
      </section>

      {/* <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {SUPPORT_TYPES.map((type) => (
            <button
              key={type.title}
              type="button"
              onClick={() => selectSupportType(type.audienceType)}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left hover:border-secondary hover:bg-secondary/5"
            >
              <h3 className="text-base font-semibold text-gray-900">{type.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </section> */}

      {/* Inquiry form — on hold for now in favor of direct booking/WhatsApp below.
      <section ref={formRef} className="mx-auto max-w-2xl px-6 pb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Inquiry Form</p>
        <h2 className="mt-2 text-3xl font-semibold text-main">Let&apos;s Help You Move Forward</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5 text-left">
          {submitted && (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Your message has been sent. Our team will reach out soon.
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Full Name"
              required
              placeholder="Jane Smith"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="jane@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Input
            label="Phone Number"
            required
            placeholder="+234 800 000 0000"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">I&apos;m reaching out as</label>
            <select
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("audience_type")}
            >
              <option value="individual">An individual learner</option>
              <option value="corporate">A company / organisation</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">
              Message <span className="text-secondary">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your learning needs and goals..."
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("message")}
            />
            {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={createLead.isPending}
            className="rounded-md bg-main px-6 py-3.5 text-sm font-semibold text-white hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createLead.isPending ? "Sending…" : "Submit Inquiry →"}
          </button>
        </form>
      </section>
      */}

      <section ref={formRef} className="mx-auto max-w-4xl px-6 pb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Get In Touch</p>
        <h2 className="mt-2 text-3xl font-semibold text-main">Let&apos;s Help You Move Forward</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
          Pick whichever works best for you — book time directly on our calendar, or chat with us
          on WhatsApp for a quick response.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-5 text-left sm:grid-cols-2">
          <a
            href="https://calendly.com/careercentra/training-consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-secondary hover:bg-secondary/5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-main/10 text-main">
              <CalendarIcon />
            </span>
            <h3 className="mt-4 text-base font-semibold text-gray-900">Book a Session</h3>
            <p className="mt-2 text-sm text-gray-500">
              Schedule a free training consultation at a time that works for you.
            </p>
            <span className="mt-4 text-sm font-medium text-secondary">Schedule Meeting →</span>
          </a>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-secondary hover:bg-secondary/5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-main/10 text-main">
              <WhatsAppIcon />
            </span>
            <h3 className="mt-4 text-base font-semibold text-gray-900">Chat on WhatsApp</h3>
            <p className="mt-2 text-sm text-gray-500">
              Message our team directly for a quick reply to your questions.
            </p>
            <span className="mt-4 text-sm font-medium text-secondary">Start Chat →</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
