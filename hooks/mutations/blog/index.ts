import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { NormalizedError } from "@/types/api";
import {
  approveComment,
  createBlogCategory,
  createBlogComment,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogPost,
  deleteComment,
  featureBlogPost,
  patchBlogCategory,
  patchBlogPost,
  publishBlogPost,
  resendNewsletterIssue,
  resendSubscriberConfirmation,
  scheduleBlogPost,
  subscribeNewsletter,
  confirmNewsletter,
  unsubscribeNewsletter,
  unpublishBlogPost,
  updateBlogPost,
} from "@/lib/api/blog";
import type {
  BlogCategory,
  BlogComment,
  BlogPostActionResult,
  BlogPostAdmin,
  CreateBlogCategoryRequest,
  CreateBlogCommentRequest,
  CreateBlogPostRequest,
  NewsletterActionResult,
  NewsletterIssue,
  NewsletterSubscriber,
  PatchBlogCategoryRequest,
  PatchBlogPostRequest,
} from "@/types/blog";

function invalidatePostLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["blog", "posts"] });
  queryClient.invalidateQueries({ queryKey: ["blog", "admin", "posts"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.blog.landing });
}

// ---------------------------------------------------------------------------------- public

export function useCreateBlogComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<BlogComment, NormalizedError, CreateBlogCommentRequest>({
    mutationFn: (payload) => createBlogComment(slug, payload),
    onSuccess: () => {
      // The new comment stays unapproved/invisible until moderated, so nothing to refetch on the
      // public thread — this just keeps the admin queue's pending count fresh if it's open.
      queryClient.invalidateQueries({ queryKey: ["blog", "admin", "comments"] });
    },
  });
}

export function useConfirmNewsletter() {
  return useMutation<NewsletterActionResult, NormalizedError, string>({
    mutationFn: confirmNewsletter,
  });
}

export function useUnsubscribeNewsletter() {
  return useMutation<NewsletterActionResult, NormalizedError, string>({
    mutationFn: unsubscribeNewsletter,
  });
}

export function useSubscribeNewsletter() {
  return useMutation<NewsletterActionResult, NormalizedError, { email: string; cfTurnstileResponse?: string }>({
    mutationFn: ({ email, cfTurnstileResponse }) => subscribeNewsletter(email, cfTurnstileResponse),
  });
}

// --------------------------------------------------------------------- editorial: posts

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<BlogPostAdmin, NormalizedError, CreateBlogPostRequest>({
    mutationFn: createBlogPost,
    onSuccess: () => invalidatePostLists(queryClient),
  });
}

export function useUpdateBlogPost(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<BlogPostAdmin, NormalizedError, CreateBlogPostRequest>({
    mutationFn: (payload) => updateBlogPost(slug, payload),
    onSuccess: () => {
      invalidatePostLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(slug) });
    },
  });
}

export function usePatchBlogPost(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<BlogPostAdmin, NormalizedError, PatchBlogPostRequest>({
    mutationFn: (payload) => patchBlogPost(slug, payload),
    onSuccess: () => {
      invalidatePostLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(slug) });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<void, NormalizedError, string>({
    mutationFn: (slug) => deleteBlogPost(slug),
    onSuccess: () => invalidatePostLists(queryClient),
  });
}

function usePostAction(fn: (slug: string) => Promise<BlogPostActionResult>) {
  const queryClient = useQueryClient();
  return useMutation<BlogPostActionResult, NormalizedError, string>({
    mutationFn: fn,
    onSuccess: (_, slug) => {
      invalidatePostLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(slug) });
    },
  });
}

export function usePublishBlogPost() {
  return usePostAction(publishBlogPost);
}

export function useUnpublishBlogPost() {
  return usePostAction(unpublishBlogPost);
}

export function useScheduleBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<BlogPostActionResult, NormalizedError, { slug: string; scheduledFor: string }>({
    mutationFn: ({ slug, scheduledFor }) => scheduleBlogPost(slug, scheduledFor),
    onSuccess: (_, { slug }) => {
      invalidatePostLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(slug) });
    },
  });
}

export function useFeatureBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<BlogPostAdmin, NormalizedError, { slug: string; isFeatured: boolean }>({
    mutationFn: ({ slug, isFeatured }) => featureBlogPost(slug, isFeatured),
    onSuccess: () => invalidatePostLists(queryClient),
  });
}

// --------------------------------------------------------------------- editorial: categories

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation<BlogCategory, NormalizedError, CreateBlogCategoryRequest>({
    mutationFn: createBlogCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blog.categories }),
  });
}

export function usePatchBlogCategory(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<BlogCategory, NormalizedError, PatchBlogCategoryRequest>({
    mutationFn: (payload) => patchBlogCategory(slug, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blog.categories }),
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, NormalizedError, string>({
    mutationFn: (slug) => deleteBlogCategory(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blog.categories }),
  });
}

// --------------------------------------------------------------------- editorial: comments

export function useApproveComment() {
  const queryClient = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: approveComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog", "admin", "comments"] }),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation<void, NormalizedError, number>({
    mutationFn: deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog", "admin", "comments"] }),
  });
}

// --------------------------------------------------------------------- editorial: newsletter

export function useResendNewsletterIssue() {
  const queryClient = useQueryClient();
  return useMutation<NewsletterIssue, NormalizedError, number>({
    mutationFn: resendNewsletterIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blog.newsletterIssues }),
  });
}

export function useResendSubscriberConfirmation() {
  const queryClient = useQueryClient();
  return useMutation<NewsletterSubscriber, NormalizedError, number>({
    mutationFn: resendSubscriberConfirmation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["blog", "newsletter", "subscribers"] }),
  });
}
