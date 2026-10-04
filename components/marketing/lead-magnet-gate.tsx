"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useDownloadLeadMagnet } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// Wraps any trigger (a button, a card) and gates the download behind an email. Only the email is
// required — name is optional, matching what the endpoint itself needs. The presigned URL expires
// after 15 minutes, so it's opened straight away rather than kept around.
export function LeadMagnetGate({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const download = useDownloadLeadMagnet(slug);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = (values: FormValues) => {
    download.mutate(
      {
        email: values.email.trim(),
        first_name: values.first_name?.trim() || undefined,
        last_name: values.last_name?.trim() || undefined,
      },
      {
        onSuccess: ({ file_url }) => {
          window.open(file_url, "_blank", "noopener,noreferrer");
          toast.success("Your download is starting.");
          reset();
          setOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      <span onClick={() => setOpen(true)} onKeyDown={(e) => e.key === "Enter" && setOpen(true)} role="button" tabIndex={0}>
        {children}
      </span>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">Get your free download</h2>
          <p className="mt-1 text-sm text-gray-500">Enter your email and we&apos;ll send you straight to the file.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
            <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" error={errors.first_name?.message} {...register("first_name")} />
              <Input label="Last name" error={errors.last_name?.message} {...register("last_name")} />
            </div>
            <Button type="submit" loading={download.isPending}>
              Download
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
