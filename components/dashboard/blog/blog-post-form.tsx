"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBlogCategories } from "@/hooks/queries/blog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BlogPostStatus, CreateBlogPostRequest } from "@/types/blog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  excerpt: z.string().min(1, "Excerpt is required").max(400, "Keep the excerpt under 400 characters"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.enum(["draft", "pending_review", "published", "archived"]),
  is_featured: z.boolean(),
  scheduled_for: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export interface BlogPostFormInitialValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: number;
  tags: string[];
  meta_title: string;
  meta_description: string;
  status: BlogPostStatus;
  is_featured: boolean;
  scheduled_for: string; // yyyy-MM-ddThh:mm, or ""
  cover_image_url: string;
}

export function BlogPostForm({
  initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onClose,
}: {
  initialValues?: BlogPostFormInitialValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: CreateBlogPostRequest) => void;
  onClose: () => void;
}) {
  const { data: categoriesData } = useBlogCategories();
  const categories = categoriesData?.results ?? [];
  const [slugTouched, setSlugTouched] = useState(!!initialValues);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          category: String(initialValues.category),
          tags: initialValues.tags.join(", "),
        }
      : { status: "draft", is_featured: false },
  });

  const status = watch("status");

  const submit = (values: FormValues) => {
    const tags = (values.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: values.title.trim(),
      slug: values.slug.trim(),
      excerpt: values.excerpt.trim(),
      content: values.content,
      category: Number(values.category),
      tags,
      meta_title: values.meta_title?.trim() ?? "",
      meta_description: values.meta_description?.trim() ?? "",
      status: values.status,
      is_featured: values.is_featured,
      ...(values.scheduled_for && { scheduled_for: new Date(values.scheduled_for).toISOString() }),
      ...(coverImage && { cover_image: coverImage }),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-3xl flex-col gap-5">
      <Input
        label="Title"
        required
        placeholder="e.g. Five Habits of High-Performing Remote Teams"
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
        placeholder="e.g. five-habits-remote-teams"
        error={errors.slug?.message}
        {...register("slug", { onChange: () => setSlugTouched(true) })}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">
          Excerpt <span className="text-secondary">*</span>
        </label>
        <textarea
          rows={2}
          placeholder="A one or two sentence teaser shown on cards and search results"
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          {...register("excerpt")}
        />
        {errors.excerpt && <p className="text-xs text-red-500">{errors.excerpt.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">
          Content <span className="text-secondary">*</span>
        </label>
        <textarea
          rows={16}
          placeholder="Write in Markdown — # for headings, **bold**, - for lists, etc."
          className="w-full rounded-md border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          {...register("content")}
        />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">Cover Image</label>
        {initialValues?.cover_image_url && !coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for
          <img src={initialValues.cover_image_url} alt="" className="h-32 w-full max-w-sm rounded-lg object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">
            Category <span className="text-secondary">*</span>
          </label>
          <select
            defaultValue=""
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("category")}
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
        </div>
        <Input label="Tags" placeholder="career, remote, agile (comma separated)" {...register("tags")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-900">Status</label>
          <select
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            {...register("status")}
          >
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        {(status === "draft" || status === "pending_review") && (
          <Input label="Schedule For (optional)" type="datetime-local" {...register("scheduled_for")} />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary" {...register("is_featured")} />
        Feature this post
      </label>

      <div className="rounded-md border border-gray-200 p-3">
        <p className="text-sm font-medium text-gray-900">SEO (optional)</p>
        <div className="mt-3 flex flex-col gap-3">
          <Input label="Meta Title" placeholder="Defaults to the post title" {...register("meta_title")} />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-900">Meta Description</label>
            <textarea
              rows={2}
              placeholder="Defaults to the excerpt"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("meta_description")}
            />
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
        <Button type="submit" loading={isPending} className="w-auto px-6">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
