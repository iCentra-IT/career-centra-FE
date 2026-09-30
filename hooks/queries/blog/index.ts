import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
  getAdminBlogPosts,
  getAdminComments,
  getBlogAnalytics,
  getBlogCategories,
  getBlogCategoryPosts,
  getBlogLanding,
  getBlogPost,
  getBlogPostComments,
  getBlogPosts,
  getNewsletterIssue,
  getNewsletterIssues,
  getNewsletterSubscribers,
  getNewsletterSummary,
} from "@/lib/api/blog";
import type {
  AdminBlogPostFilters,
  AdminCommentFilters,
  BlogPostListFilters,
  NewsletterSubscriberFilters,
} from "@/types/blog";

// Public — no auth required, so no `enabled` gate on an access token.

export function useBlogLanding() {
  return useQuery({
    queryKey: queryKeys.blog.landing,
    queryFn: getBlogLanding,
    staleTime: 60 * 1000,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: queryKeys.blog.categories,
    queryFn: getBlogCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogCategoryPosts(slug: string, page?: number) {
  return useQuery({
    queryKey: queryKeys.blog.categoryPosts(slug, page),
    queryFn: () => getBlogCategoryPosts(slug, page),
    enabled: !!slug,
  });
}

export function useBlogPosts(filters?: BlogPostListFilters & { page?: number }) {
  return useQuery({
    queryKey: queryKeys.blog.posts(filters),
    queryFn: () => getBlogPosts(filters),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blog.post(slug),
    queryFn: () => getBlogPost(slug),
    enabled: !!slug,
  });
}

export function useBlogPostComments(slug: string) {
  return useQuery({
    queryKey: queryKeys.blog.comments(slug),
    queryFn: () => getBlogPostComments(slug),
    enabled: !!slug,
  });
}

// Editorial (staff-admin / marketer) — behind auth, but this app doesn't gate admin queries on
// the access token elsewhere either (relies on the backend 401ing), so match that convention.

export function useAdminBlogPosts(filters?: AdminBlogPostFilters) {
  return useQuery({
    queryKey: queryKeys.blog.adminPosts(filters),
    queryFn: () => getAdminBlogPosts(filters),
  });
}

export function useAdminComments(filters?: AdminCommentFilters) {
  return useQuery({
    queryKey: queryKeys.blog.adminComments(filters),
    queryFn: () => getAdminComments(filters),
  });
}

export function useBlogAnalytics(days?: number | "all") {
  return useQuery({
    queryKey: queryKeys.blog.analytics(days),
    queryFn: () => getBlogAnalytics(days),
  });
}

export function useNewsletterIssues() {
  return useQuery({
    queryKey: queryKeys.blog.newsletterIssues,
    queryFn: getNewsletterIssues,
  });
}

export function useNewsletterIssue(id: number) {
  return useQuery({
    queryKey: queryKeys.blog.newsletterIssue(id),
    queryFn: () => getNewsletterIssue(id),
    enabled: !!id,
  });
}

export function useNewsletterSubscribers(filters?: NewsletterSubscriberFilters) {
  return useQuery({
    queryKey: queryKeys.blog.newsletterSubscribers(filters),
    queryFn: () => getNewsletterSubscribers(filters),
  });
}

export function useNewsletterSummary() {
  return useQuery({
    queryKey: queryKeys.blog.newsletterSummary,
    queryFn: getNewsletterSummary,
  });
}
