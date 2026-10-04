"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateCrmLead, usePatchCrmLead } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CrmLead, CrmLeadWriteRequest } from "@/types/crm";

const SOURCE_OPTIONS = ["enquiry", "newsletter", "waitlist", "lead_magnet", "external"] as const;
const PLATFORM_OPTIONS = ["learning", "careercentra"] as const;
const AUDIENCE_OPTIONS = ["individual", "enterprise", "executive"] as const;
const INTENT_OPTIONS = ["", "high", "mid", "low"] as const;

const selectClass =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary";

const schema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  source: z.enum(SOURCE_OPTIONS),
  platform: z.enum(PLATFORM_OPTIONS),
  audience_type: z.enum(AUDIENCE_OPTIONS),
  intent_level: z.enum(INTENT_OPTIONS),
  campaign_source: z.string().optional(),
  url: z.string().optional(),
  message: z.string().optional(),
  next_follow_up_date: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CrmLeadForm({ basePath, lead }: { basePath: string; lead?: CrmLead }) {
  const router = useRouter();
  const isEdit = !!lead;
  const createLead = useCreateCrmLead();
  const patchLead = usePatchCrmLead(lead?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "new",
      source: "enquiry",
      platform: "careercentra",
      audience_type: "individual",
      intent_level: "",
    },
  });

  useEffect(() => {
    if (!lead) return;
    reset({
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      job_title: lead.job_title,
      status: lead.status,
      source: lead.source,
      platform: lead.platform,
      audience_type: lead.audience_type,
      intent_level: lead.intent_level ?? "",
      campaign_source: lead.campaign_source,
      url: lead.url,
      message: lead.message,
      next_follow_up_date: toLocalInput(lead.next_follow_up_date),
    });
  }, [lead, reset]);

  const isPending = createLead.isPending || patchLead.isPending;

  const onSubmit = (values: FormValues) => {
    const payload: CrmLeadWriteRequest = {
      first_name: values.first_name?.trim() ?? "",
      last_name: values.last_name?.trim() ?? "",
      email: values.email.trim(),
      phone: values.phone?.trim() ?? "",
      company: values.company?.trim() ?? "",
      job_title: values.job_title?.trim() ?? "",
      status: values.status.trim(),
      source: values.source,
      platform: values.platform,
      audience_type: values.audience_type,
      // An empty intent is "not an intent-scored lead" — omit it entirely rather than sending "".
      ...(values.intent_level ? { intent_level: values.intent_level } : {}),
      campaign_source: values.campaign_source?.trim() ?? "",
      url: values.url?.trim() ?? "",
      message: values.message?.trim() ?? "",
      next_follow_up_date: values.next_follow_up_date
        ? new Date(values.next_follow_up_date).toISOString()
        : null,
    };

    const mutation = isEdit ? patchLead : createLead;
    mutation.mutate(payload, {
      onSuccess: (saved) => {
        toast.success(isEdit ? "Lead updated." : "Lead created.");
        router.push(`${basePath}/leads/${saved.id}`);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Lead" : "Add Lead"}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {isEdit ? "Update this lead's details." : "Log an enquiry manually — e.g. a phone call."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" error={errors.first_name?.message} {...register("first_name")} />
          <Input label="Last Name" error={errors.last_name?.message} {...register("last_name")} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
          <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
          <Input label="Company" error={errors.company?.message} {...register("company")} />
          <Input label="Job Title" error={errors.job_title?.message} {...register("job_title")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Source</label>
            <select className={selectClass} {...register("source")}>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Platform</label>
            <select className={selectClass} {...register("platform")}>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Audience</label>
            <select className={selectClass} {...register("audience_type")}>
              {AUDIENCE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Intent</label>
            <select className={selectClass} {...register("intent_level")}>
              <option value="">Not intent-scored</option>
              <option value="high">High</option>
              <option value="mid">Mid</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Input label="Status" required error={errors.status?.message} {...register("status")} />
          <Input
            label="Next Follow-up"
            type="datetime-local"
            error={errors.next_follow_up_date?.message}
            {...register("next_follow_up_date")}
          />
        </div>

        <Input label="Campaign Source" error={errors.campaign_source?.message} {...register("campaign_source")} />
        <Input label="Page URL" error={errors.url?.message} {...register("url")} />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Message / Notes</label>
          <textarea
            rows={4}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("message")}
          />
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(isEdit ? `${basePath}/leads/${lead.id}` : `${basePath}/leads`)}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <Button type="submit" loading={isPending} className="w-auto px-6">
            {isEdit ? "Save" : "Create Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
}
