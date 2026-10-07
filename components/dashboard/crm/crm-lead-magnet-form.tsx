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
import { FileFieldShell } from "@/components/ui/file-field-shell";
import type { LeadMagnet } from "@/types/crm";

// The presigned file_url's path ends in the original filename (e.g.
// ".../lead-magnets/abc123-guide.pdf?X-Amz-..."), so this is just cosmetic best-effort display —
// never parsed for anything that matters.
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1)) || "Current file";
  } catch {
    return "Current file";
  }
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M4 1.5h5l3 3v8.5a1.5 1.5 0 01-1.5 1.5h-6.5a1.5 1.5 0 01-1.5-1.5V3a1.5 1.5 0 011.5-1.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M9 1.5V4.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

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

        <FileFieldShell
          label="File"
          required={!isEdit}
          hint={
            isEdit ? "Leave empty to keep the current file. Choosing a new one replaces it and deletes the old upload." : undefined
          }
        >
          {isEdit && magnet.file_url && !file && (
            <a
              href={magnet.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
            >
              <FileIcon />
              {fileNameFromUrl(magnet.file_url)}
            </a>
          )}
          {file && <p className="flex items-center gap-2 text-sm font-medium text-gray-900"><FileIcon />{file.name}</p>}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />
        </FileFieldShell>

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
