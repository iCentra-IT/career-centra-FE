"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateBlogPost } from "@/hooks/mutations/blog";
import { BlogPostForm } from "@/components/dashboard/blog/blog-post-form";

const CreateMarketerPostPage = () => {
  const router = useRouter();
  const createPost = useCreateBlogPost();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">New Blog Post</h1>
      <p className="mt-1 text-sm text-gray-500">Saved as a draft until you publish it.</p>

      <div className="mt-8">
        <BlogPostForm
          submitLabel="Create"
          isPending={createPost.isPending}
          onClose={() => router.push("/marketer")}
          onSubmit={(payload) =>
            createPost.mutate(payload, {
              onSuccess: () => {
                toast.success("Post created.");
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

export default CreateMarketerPostPage;
