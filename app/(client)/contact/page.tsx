"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SUPPORT_TYPES = [
  {
    title: "Individual Learning Support",
    description: "Get help selecting the right certification track and learning pathway.",
  },
  {
    title: "Enterprise Learning Consultation",
    description: "Discuss workforce capability, corporate programs, and enterprise learning solutions.",
  },
  {
    title: "Executive Programs Advisory",
    description: "Learn more about leadership and executive learning opportunities.",
  },
];

const inquirySchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  organization: z.string().optional(),
  area_of_interest: z.string().optional(),
  message: z.string().min(1, "Please share a few details about what you need"),
});
type InquiryFormValues = z.infer<typeof inquirySchema>;

const ContactPage = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InquiryFormValues>({ resolver: zodResolver(inquirySchema) });

  const onSubmit = () => {
    // No inquiry/lead API exists yet — don't pretend this was sent anywhere.
    setSubmitted(true);
  };

  const selectSupportType = (title: string) => {
    setValue("area_of_interest", title);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-main to-deep-blue px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
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

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {SUPPORT_TYPES.map((type) => (
            <button
              key={type.title}
              type="button"
              onClick={() => selectSupportType(type.title)}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left hover:border-secondary hover:bg-secondary/5"
            >
              <h3 className="text-base font-semibold text-gray-900">{type.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section ref={formRef} className="mx-auto max-w-2xl px-6 pb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Inquiry Form</p>
        <h2 className="mt-2 text-3xl font-semibold text-main">Let&apos;s Help You Move Forward</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5 text-left">
          {submitted && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This form isn&apos;t connected to a backend yet, so your message wasn&apos;t actually
              sent anywhere. Nothing to worry about — just letting you know rather than pretending
              it went through.
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Full Name
              </label>
              <input
                placeholder="Jane Smith"
                className="rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                {...register("full_name")}
              />
              {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email Address
              </label>
              <input
                placeholder="jane@company.com"
                className="rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Organization
            </label>
            <input
              placeholder="Company Name"
              className="rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("organization")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Area of Interest
            </label>
            <select
              defaultValue=""
              className="rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("area_of_interest")}
            >
              <option value="" disabled>
                Select area of interest...
              </option>
              {SUPPORT_TYPES.map((type) => (
                <option key={type.title} value={type.title}>
                  {type.title}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your learning needs and goals..."
              className="rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("message")}
            />
            {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            className="rounded-md bg-main px-6 py-3.5 text-sm font-semibold text-white hover:bg-deep-blue"
          >
            Submit Inquiry →
          </button>
        </form>
      </section>
    </div>
  );
};

export default ContactPage;
