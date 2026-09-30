// lib/api/types/blog.ts
//
// Confirmed live against the real backend (api-learning.icentra.com already has seeded posts) for
// every read endpoint below — the Swagger docs for this app are known to sometimes show misleading
// placeholder shapes (bare arrays, `"string"` fields that are actually arrays), and that was true
// here too: GET /api/blog/, /api/blog/categories/, /api/blog/posts/ and /api/blog/posts/{slug}/ all
// actually come back in this app's usual {success, message, data} or paginated
// {success, count, total_pages, next, previous, results} envelopes, never the bare
// array/free-form shape Swagger showed. `tags` is a real string array on read, not a single
// string. Write/admin-only shapes (create/update a post, admin list, analytics, newsletter) are
// not independently confirmed live (need staff-admin/marketer auth) — modeled from the Swagger
// samples, which is what the rest of this codebase falls back on when a live capture isn't
// possible yet.

export type BlogPostStatus = "draft" | "pending_review" | "published" | "archived";

// GET /api/blog/categories/ and the categories array embedded in GET /api/blog/ — confirmed live.
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  public_post_count: number;
}

export interface CreateBlogCategoryRequest {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  order: number;
}

export type PatchBlogCategoryRequest = Partial<CreateBlogCategoryRequest>;

// The card/list shape — GET /api/blog/posts/, /api/blog/categories/{slug}/, and the
// latest_posts/featured_posts arrays on GET /api/blog/. Confirmed live.
export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  category_name: string;
  tags: string[];
  is_featured: boolean;
  reading_time_minutes: number;
  published_at: string;
}

// GET /api/blog/ — a single call for the landing page. Confirmed live.
export interface BlogLanding {
  latest_posts: BlogPostSummary[];
  featured_posts: BlogPostSummary[];
  categories: BlogCategory[];
}

export interface BlogComment {
  id: number;
  author_name: string;
  is_guest: boolean;
  body: string;
  created_at: string;
}

// GET /api/blog/posts/{slug}/ — confirmed live (comments/related_posts are real BlogComment[] /
// BlogPostSummary[] arrays, not the free-form {additionalProp1: "string"} Swagger showed).
export interface BlogPostDetail extends BlogPostSummary {
  content: string; // Markdown — confirmed live ("# heading", paragraphs)
  category_slug: string;
  comments: BlogComment[];
  related_posts: BlogPostSummary[];
  meta_title: string;
  meta_description: string;
}

export interface CreateBlogCommentRequest {
  body: string;
  // Required for guests, ignored for a signed-in reader (always shown under their account name).
  guest_name?: string;
  // Field name UNCONFIRMED — see the matching note on RegisterRequest in types/auth.ts.
  cf_turnstile_response?: string;
}

// The full admin/editorial shape — GET/POST/PUT/PATCH /api/blog/admin/posts/ and
// /api/blog/posts/{slug}/ on write. Not independently confirmed live (needs staff-admin/marketer
// auth) — modeled from the Swagger admin samples.
export interface BlogPostAdmin {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author: number;
  author_name: string;
  category: number;
  category_name: string;
  tags: string[];
  status: BlogPostStatus;
  is_featured: boolean;
  is_public: boolean;
  is_scheduled: boolean;
  scheduled_for: string | null;
  published_at: string | null;
  view_count: number;
  pending_comment_count: number;
  reading_time_minutes: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

// POST/PUT/PATCH /api/blog/posts/{slug}/ — multipart/form-data whenever cover_image is a real
// File (see lib/api/blog/index.ts — tags is sent as a repeated form key, tags=a&tags=b, NOT the
// bracketed-index nesting lib/api/form-data.ts's toRequestBody uses for other endpoints, so this
// app posts its own FormData builder for blog posts rather than reusing that helper).
export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: File;
  category: number;
  tags: string[];
  meta_title: string;
  meta_description: string;
  status: BlogPostStatus;
  is_featured: boolean;
  scheduled_for?: string;
}

export type PatchBlogPostRequest = Partial<CreateBlogPostRequest>;

// POST /api/blog/admin/posts/{slug}/publish|schedule|unpublish/ and PATCH .../feature/ — the
// lighter action-endpoint response shape (not the full BlogPostAdmin).
export interface BlogPostActionResult {
  id: number;
  slug: string;
  status: string;
  is_public: boolean;
  published_at: string | null;
  scheduled_for: string | null;
}

export interface AdminBlogPostFilters {
  mine?: boolean;
  search?: string;
  status?: BlogPostStatus;
}

export interface BlogPostListFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  tag?: string;
}

// GET /api/blog/admin/comments/ — moderation queue.
export interface BlogAdminComment {
  id: number;
  post_title: string;
  post_slug: string;
  author_name: string;
  is_guest: boolean;
  author_email: string;
  body: string;
  is_approved: boolean;
  created_at: string;
}

export interface AdminCommentFilters {
  approved?: boolean;
  post?: string;
}

// GET /api/blog/admin/analytics/
export interface BlogAnalyticsTopPost {
  post_id: number;
  title: string;
  slug: string;
  view_count: number;
  period_views: number;
}

export interface BlogAnalytics {
  since: string;
  total_posts: number;
  total_views: number;
  unique_readers: number;
  top_posts: BlogAnalyticsTopPost[];
}

export type NewsletterIssueStatus = "pending" | "sending" | "sent" | "failed" | string;

// GET /api/blog/newsletter/admin/issues/ and /{id}/
export interface NewsletterIssue {
  id: number;
  subject: string;
  post: number | null;
  post_title: string;
  post_slug: string;
  status: NewsletterIssueStatus;
  sent_at: string | null;
  recipient_count: number;
  failed_count: number;
  error: string;
  created_at: string;
}

export type NewsletterSubscriberStatus = "pending" | "active" | "unsubscribed" | "bounced";

// GET /api/blog/newsletter/admin/subscribers/
export interface NewsletterSubscriber {
  id: number;
  email: string;
  status: NewsletterSubscriberStatus;
  status_display: string;
  source: string;
  user: number | null;
  subscribed_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
}

export interface NewsletterSubscriberFilters {
  search?: string;
  status?: NewsletterSubscriberStatus;
}

// GET /api/blog/newsletter/admin/summary/
export interface NewsletterSummary {
  total_subscribers: number;
  active_subscribers: number;
  pending_subscribers: number;
  issues_sent: number;
  last_sent_at: string | null;
}

export interface NewsletterActionResult {
  email: string;
  status: string;
  message: string;
}
