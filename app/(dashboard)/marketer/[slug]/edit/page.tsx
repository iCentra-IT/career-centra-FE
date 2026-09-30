"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminBlogPosts } from "@/hooks/queries/blog";
import { useUpdateBlogPost } from "@/hooks/mutations/blog";
import { BlogPostForm } from "@/components/dashboard/blog/blog-post-form";
import { FormSkeleton } from "@/components/ui/skeleton";

const EditMarketerPostPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const router = useRouter();
  const { data: posts, isLoading } = useAdminBlogPosts();
  const post = posts?.find((p) => p.slug === slug);
  const updatePost = useUpdateBlogPost(slug);

  if (isLoading) return <FormSkeleton fields={8} />;
  if (!post) return <p className="text-sm text-gray-400">Post not found.</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Edit Blog Post</h1>
      <p className="mt-1 text-sm text-gray-500">{post.title}</p>

      <div className="mt-8">
        <BlogPostForm
          submitLabel="Save"
          isPending={updatePost.isPending}
          onClose={() => router.push("/marketer")}
          initialValues={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags,
            meta_title: post.meta_title,
            meta_description: post.meta_description,
            status: post.status,
            is_featured: post.is_featured,
            scheduled_for: post.scheduled_for ? post.scheduled_for.slice(0, 16) : "",
            cover_image_url: post.cover_image_url,
          }}
          onSubmit={(payload) =>
            updatePost.mutate(payload, {
              onSuccess: () => {
                toast.success("Post updated.");
                router.push("/marketer");
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      </div>
    </div>
  );
};

export default EditMarketerPostPage;
