import type { Metadata } from "next";
import { getBlogCategories } from "@/lib/api/blog";
import { BlogCategoryContent } from "@/components/marketing/blog-category-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { results } = await getBlogCategories();
    const category = results.find((c) => c.slug === slug);
    if (!category) return { title: "Category" };
    return {
      title: category.name,
      description: category.description || `Articles in ${category.name} on the CareerCentra blog.`,
      alternates: { canonical: `/blog/category/${category.slug}` },
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogCategoryContent slug={slug} />;
}
