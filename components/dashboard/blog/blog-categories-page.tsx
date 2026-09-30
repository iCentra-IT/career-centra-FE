"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useBlogCategories } from "@/hooks/queries/blog";
import { useCreateBlogCategory, useDeleteBlogCategory, usePatchBlogCategory } from "@/hooks/mutations/blog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table";
import { TrashIcon } from "@/components/ui/trash-icon";
import { PencilIcon } from "@/components/ui/pencil-icon";
import type { BlogCategory } from "@/types/blog";

const COLUMNS = ["Name", "Slug", "Description", "Published Posts", "Action"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().optional(),
  is_active: z.boolean(),
  order: z.coerce.number().min(0),
});
type FormValues = z.infer<typeof schema>;

function CategoryModal({ category, onClose }: { category: BlogCategory | "new" | null; onClose: () => void }) {
  const isEdit = category !== "new" && category !== null;
  const createCategory = useCreateBlogCategory();
  const patchCategory = usePatchBlogCategory(isEdit ? category.slug : "");
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? { name: category.name, slug: category.slug, description: category.description, is_active: true, order: 0 }
      : { is_active: true, order: 0 },
  });

  if (!category) return null;
  const isPending = createCategory.isPending || patchCategory.isPending;

  const submit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description?.trim() ?? "",
      is_active: values.is_active,
      order: values.order,
    };
    const mutation = isEdit ? patchCategory : createCategory;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? "Category updated." : "Category created.");
        onClose();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Modal open onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Category" : "New Category"}</h2>
        <form onSubmit={handleSubmit(submit)} className="mt-5 flex flex-col gap-4">
          <Input
            label="Name"
            required
            error={errors.name?.message}
            {...register("name", {
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
              rows={2}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              {...register("description")}
            />
          </div>
          <Input label="Order" type="number" {...register("order")} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary" {...register("is_active")} />
            Active
          </label>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button type="submit" loading={isPending} className="flex-1">
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export function BlogCategoriesPage() {
  const { data: categories, isLoading } = useBlogCategories();
  const [editTarget, setEditTarget] = useState<BlogCategory | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null);
  const deleteCategory = useDeleteBlogCategory();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.slug, {
      onSuccess: () => {
        toast.success("Category deleted.");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Blog Categories</h1>
          <p className="mt-1 text-sm text-gray-500">Organize articles into topics.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditTarget("new")}
          className="rounded-full bg-main px-5 py-2.5 text-sm font-medium text-white hover:bg-deep-blue"
        >
          + New Category
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <TableSkeleton columns={COLUMNS} />
        ) : !categories || categories.results.length === 0 ? (
          <EmptyTableState columns={COLUMNS} message="No categories yet." />
        ) : (
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-5 py-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.results.map((category) => (
                <tr key={category.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-5 py-4 text-gray-600">{category.slug}</td>
                  <td className="max-w-xs px-5 py-4 text-gray-600">
                    <span className="line-clamp-1">{category.description || "—"}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{category.public_post_count}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditTarget(category)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Edit category"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Delete category"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editTarget && <CategoryModal category={editTarget} onClose={() => setEditTarget(null)} />}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This can't be undone.`}
        loading={deleteCategory.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
