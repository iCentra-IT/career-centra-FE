// lib/api/blog/index.ts
import { apiClient } from "../client";
import { ApiResponse, PaginatedResponse, unwrapList, unwrapObject } from "@/types/api";
import type {
  AdminBlogPostFilters,
  AdminCommentFilters,
  BlogAdminComment,
  BlogAnalytics,
  BlogCategory,
  BlogComment,
  BlogLanding,
  BlogPostActionResult,
  BlogPostAdmin,
  BlogPostDetail,
  BlogPostListFilters,
  BlogPostSummary,
  CreateBlogCategoryRequest,
  CreateBlogCommentRequest,
  CreateBlogPostRequest,
  NewsletterActionResult,
  NewsletterIssue,
  NewsletterSubscriber,
  NewsletterSubscriberFilters,
  NewsletterSummary,
  PatchBlogCategoryRequest,
  PatchBlogPostRequest,
} from "@/types/blog";

// ---------------------------------------------------------------- public reads (confirmed live)

export async function getBlogLanding(): Promise<BlogLanding> {
  const { data } = await apiClient.get<ApiResponse<BlogLanding>>("/api/blog/");
  return data.data;
}

export async function getBlogCategories(): Promise<PaginatedResponse<BlogCategory>> {
  const { data } = await apiClient.get<PaginatedResponse<BlogCategory>>("/api/blog/categories/");
  return data;
}

export async function getBlogCategoryPosts(
  slug: string,
  page?: number,
): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<BlogPostSummary>>(
    `/api/blog/categories/${slug}/`,
    { params: { page } },
  );
  return data;
}

export async function getBlogPosts(
  filters?: BlogPostListFilters & { page?: number },
): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<BlogPostSummary>>("/api/blog/posts/", {
    params: filters,
  });
  return data;
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail> {
  const { data } = await apiClient.get<ApiResponse<BlogPostDetail>>(`/api/blog/posts/${slug}/`);
  return data.data;
}

export async function getBlogPostComments(slug: string): Promise<PaginatedResponse<BlogComment>> {
  const { data } = await apiClient.get<PaginatedResponse<BlogComment>>(
    `/api/blog/posts/${slug}/comments/`,
  );
  return data;
}

export async function createBlogComment(
  slug: string,
  payload: CreateBlogCommentRequest,
): Promise<BlogComment> {
  const { data } = await apiClient.post<ApiResponse<BlogComment>>(
    `/api/blog/posts/${slug}/comments/`,
    payload,
  );
  return data.data;
}

// -------------------------------------------------------------------------- newsletter (public)

// cf_turnstile_response: field name UNCONFIRMED — see the matching note on RegisterRequest in
// types/auth.ts.
export async function subscribeNewsletter(
  email: string,
  cfTurnstileResponse?: string,
): Promise<NewsletterActionResult> {
  const { data } = await apiClient.post<ApiResponse<NewsletterActionResult>>(
    "/api/blog/newsletter/subscribe/",
    { email, cf_turnstile_response: cfTurnstileResponse },
  );
  return unwrapObject<NewsletterActionResult>(data);
}

export async function confirmNewsletter(token: string): Promise<NewsletterActionResult> {
  const { data } = await apiClient.get<ApiResponse<NewsletterActionResult>>(
    `/api/blog/newsletter/confirm/${token}/`,
  );
  return unwrapObject<NewsletterActionResult>(data);
}

export async function unsubscribeNewsletter(token: string): Promise<NewsletterActionResult> {
  const { data } = await apiClient.get<ApiResponse<NewsletterActionResult>>(
    `/api/blog/newsletter/unsubscribe/${token}/`,
  );
  return unwrapObject<NewsletterActionResult>(data);
}

// ------------------------------------------------------------------ post write (staff-admin/marketer)

// tags goes over the wire as a repeated form key (tags=a&tags=b) whenever this is sent as
// multipart — NOT the bracketed-index nesting lib/api/form-data.ts's toRequestBody uses for other
// endpoints (e.g. programs), so this builds its own FormData rather than reusing that helper.
// Multipart is only needed when cover_image is a real File; otherwise plain JSON (tags as a normal
// array) is simpler and works the same on the backend.
function blogPostFormData(payload: CreateBlogPostRequest | PatchBlogPostRequest): FormData {
  const formData = new FormData();
  const { tags, cover_image, ...rest } = payload;

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null) continue;
    formData.append(key, String(value));
  }
  tags?.forEach((tag) => formData.append("tags", tag));
  if (cover_image) formData.append("cover_image", cover_image);
  return formData;
}

function blogPostRequestBody(payload: CreateBlogPostRequest | PatchBlogPostRequest) {
  if (payload.cover_image instanceof File) {
    return { body: blogPostFormData(payload), headers: { "Content-Type": undefined } };
  }
  const json = { ...payload };
  delete json.cover_image;
  return { body: json };
}

export async function createBlogPost(payload: CreateBlogPostRequest): Promise<BlogPostAdmin> {
  const { body, headers } = blogPostRequestBody(payload);
  const { data } = await apiClient.post<ApiResponse<BlogPostAdmin>>("/api/blog/posts/", body, {
    headers,
  });
  return unwrapObject<BlogPostAdmin>(data);
}

export async function updateBlogPost(
  slug: string,
  payload: CreateBlogPostRequest,
): Promise<BlogPostAdmin> {
  const { body, headers } = blogPostRequestBody(payload);
  const { data } = await apiClient.put<ApiResponse<BlogPostAdmin>>(
    `/api/blog/posts/${slug}/`,
    body,
    { headers },
  );
  return unwrapObject<BlogPostAdmin>(data);
}

export async function patchBlogPost(
  slug: string,
  payload: PatchBlogPostRequest,
): Promise<BlogPostAdmin> {
  const { body, headers } = blogPostRequestBody(payload);
  const { data } = await apiClient.patch<ApiResponse<BlogPostAdmin>>(
    `/api/blog/posts/${slug}/`,
    body,
    { headers },
  );
  return unwrapObject<BlogPostAdmin>(data);
}

export async function deleteBlogPost(slug: string): Promise<void> {
  await apiClient.delete(`/api/blog/posts/${slug}/`);
}

// --------------------------------------------------------------------------- admin/editorial

export async function getAdminBlogPosts(
  filters?: AdminBlogPostFilters,
): Promise<BlogPostAdmin[]> {
  const { data } = await apiClient.get("/api/blog/admin/posts/", { params: filters });
  return unwrapList<BlogPostAdmin>(data);
}

export async function featureBlogPost(slug: string, isFeatured: boolean): Promise<BlogPostAdmin> {
  const { data } = await apiClient.patch<ApiResponse<BlogPostAdmin>>(
    `/api/blog/admin/posts/${slug}/feature/`,
    { is_featured: isFeatured },
  );
  return unwrapObject<BlogPostAdmin>(data);
}

export async function publishBlogPost(slug: string): Promise<BlogPostActionResult> {
  const { data } = await apiClient.post<ApiResponse<BlogPostActionResult>>(
    `/api/blog/admin/posts/${slug}/publish/`,
  );
  return unwrapObject<BlogPostActionResult>(data);
}

export async function scheduleBlogPost(
  slug: string,
  scheduledFor: string,
): Promise<BlogPostActionResult> {
  const { data } = await apiClient.post<ApiResponse<BlogPostActionResult>>(
    `/api/blog/admin/posts/${slug}/schedule/`,
    { scheduled_for: scheduledFor },
  );
  return unwrapObject<BlogPostActionResult>(data);
}

export async function unpublishBlogPost(slug: string): Promise<BlogPostActionResult> {
  const { data } = await apiClient.post<ApiResponse<BlogPostActionResult>>(
    `/api/blog/admin/posts/${slug}/unpublish/`,
  );
  return unwrapObject<BlogPostActionResult>(data);
}

// ------------------------------------------------------------------------------- categories (write)

export async function createBlogCategory(payload: CreateBlogCategoryRequest): Promise<BlogCategory> {
  const { data } = await apiClient.post<ApiResponse<BlogCategory>>("/api/blog/categories/", payload);
  return unwrapObject<BlogCategory>(data);
}

export async function patchBlogCategory(
  slug: string,
  payload: PatchBlogCategoryRequest,
): Promise<BlogCategory> {
  const { data } = await apiClient.patch<ApiResponse<BlogCategory>>(
    `/api/blog/categories/${slug}/`,
    payload,
  );
  return unwrapObject<BlogCategory>(data);
}

export async function deleteBlogCategory(slug: string): Promise<void> {
  await apiClient.delete(`/api/blog/categories/${slug}/`);
}

// ------------------------------------------------------------------------------- comment moderation

export async function getAdminComments(filters?: AdminCommentFilters): Promise<BlogAdminComment[]> {
  const { data } = await apiClient.get("/api/blog/admin/comments/", { params: filters });
  return unwrapList<BlogAdminComment>(data);
}

export async function approveComment(id: number): Promise<void> {
  await apiClient.post(`/api/blog/admin/comments/${id}/`, { is_approved: true });
}

export async function deleteComment(id: number): Promise<void> {
  await apiClient.delete(`/api/blog/admin/comments/${id}/`);
}

// ----------------------------------------------------------------------------------- analytics

export async function getBlogAnalytics(days?: number | "all"): Promise<BlogAnalytics> {
  const { data } = await apiClient.get<ApiResponse<BlogAnalytics>>("/api/blog/admin/analytics/", {
    params: days ? { days } : undefined,
  });
  return unwrapObject<BlogAnalytics>(data);
}

// ----------------------------------------------------------------------------------- newsletter admin

export async function getNewsletterIssues(): Promise<NewsletterIssue[]> {
  const { data } = await apiClient.get("/api/blog/newsletter/admin/issues/");
  return unwrapList<NewsletterIssue>(data);
}

export async function getNewsletterIssue(id: number): Promise<NewsletterIssue> {
  const { data } = await apiClient.get(`/api/blog/newsletter/admin/issues/${id}/`);
  return unwrapObject<NewsletterIssue>(data);
}

export async function resendNewsletterIssue(id: number): Promise<NewsletterIssue> {
  const { data } = await apiClient.post(`/api/blog/newsletter/admin/issues/${id}/resend/`);
  return unwrapObject<NewsletterIssue>(data);
}

export async function getNewsletterSubscribers(
  filters?: NewsletterSubscriberFilters,
): Promise<NewsletterSubscriber[]> {
  const { data } = await apiClient.get("/api/blog/newsletter/admin/subscribers/", {
    params: filters,
  });
  return unwrapList<NewsletterSubscriber>(data);
}

export async function resendSubscriberConfirmation(id: number): Promise<NewsletterSubscriber> {
  const { data } = await apiClient.post(
    `/api/blog/newsletter/admin/subscribers/${id}/resend-confirmation/`,
  );
  return unwrapObject<NewsletterSubscriber>(data);
}

export async function getNewsletterSummary(): Promise<NewsletterSummary> {
  const { data } = await apiClient.get<ApiResponse<NewsletterSummary>>(
    "/api/blog/newsletter/admin/summary/",
  );
  return unwrapObject<NewsletterSummary>(data);
}
