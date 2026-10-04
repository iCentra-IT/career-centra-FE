"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateLeadMagnet, usePatchLeadMagnet } from "@/hooks/mutations/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LeadMagnet } from "@/types/crm";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, hyphens and underscores only"),
  description: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function CrmLeadMagnetForm({ basePath, magnet }: { basePath: string; magnet?: LeadMagnet }) {
  const router = useRouter();
  const isEdit = !!magnet;
  const createMagnet = useCreateLeadMagnet();
  const patchMagnet = usePatchLeadMagnet(magnet?.slug ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: magnet
      ? { title: magnet.title, slug: magnet.slug, description: magnet.description, is_active: magnet.is_active }
      : { title: "", slug: "", description: "", is_active: true },
  });

  const isPending = createMagnet.isPending || patchMagnet.isPending;

  const onSubmit = (values: FormValues) => {
    if (!isEdit && !file) {
      toast.error("Choose the file visitors will download.");
      return;
    }
    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      description: values.description?.trim() ?? "",
      is_active: values.is_active,
      // Omitted when unset so a PATCH keeps the uploaded file the backend already has.
      ...(file ? { file } : {}),
    };
    const mutation = isEdit ? patchMagnet : createMagnet;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? "Lead magnet updated." : "Lead magnet created.");
        router.push(`${basePath}/lead-magnets`);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Lead Magnet" : "New Lead Magnet"}</h1>
      <p className="mt-1 text-sm text-gray-500">
        The file is stored privately. Visitors get a short-lived download link after entering their email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <Input
          label="Title"
          required
          error={errors.title?.message}
          {...register("title", {
            onChange: (e) => {
              if (!slugTouched) setValue("slug", slugify(e.target.value));
            },
          })}
        />
        <Input
          label="Slug"
          required
          error={errors.slug?.message}
          {...register("slug", { onChange: () => setSlugTouched(true) })}
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Description</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("description")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">
            File {!isEdit && <span className="text-secondary">*</span>}
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />
          {isEdit && (
            <p className="text-xs text-gray-400">
              Leave empty to keep the current file. Choosing a new one replaces it and deletes the old upload.
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            {...register("is_active")}
          />
          Active (visible to the download modal)
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`${basePath}/lead-magnets`)}
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <Button type="submit" loading={isPending} className="w-auto px-6">
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
