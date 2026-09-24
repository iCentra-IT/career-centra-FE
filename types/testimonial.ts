// lib/api/types/testimonial.ts
//
// A text+star-rating+photo review, distinct from a program's video-only `reviews` (see
// ProgramReview in types/programs.ts) — this is the system behind the "Testimonials" UI
// (5-star cards with a reviewer name/role/photo) that already existed as static placeholder
// content on the home page and program detail page.
//
// Confirmed real shape by a live capture of GET /api/programs/{slug}/reviews/: it's the same
// {success, count, total_pages, next, previous, results} paginated envelope every other list
// endpoint in this app uses (the Swagger doc's bare-array sample was misleading, same trap as
// /api/search/ and career-paths pagination before it). The admin list endpoint isn't directly
// confirmed (it requires auth this session doesn't have), but every other admin list endpoint in
// this app follows the identical paginated envelope, so it's modelled the same way here.
export interface ProgramTestimonial {
  id: number;
  reviewer_name: string;
  reviewer_role: string;
  reviewer_image_url: string;
  comment: string;
  rating: number;
  created_at: string;
}

// Admin/staff moderation view — adds which program it's for and whether it's live yet.
export interface AdminProgramTestimonial extends ProgramTestimonial {
  program_title: string;
  is_approved: boolean;
}

// POST /api/programs/{slug}/reviews/ — public, no auth. reviewer_image is a real file upload (the
// write side is a plain image field; the read side comes back as reviewer_image_url, same
// convention as cover_image/cover_image_url elsewhere in this app). A submitted review presumably
// starts unapproved (is_approved defaults false) until staff approve it via the admin endpoint —
// unconfirmed, since the create response sample doesn't include is_approved at all.
export interface CreateProgramTestimonialRequest {
  reviewer_name: string;
  reviewer_role: string;
  reviewer_image?: File;
  comment: string;
  rating: number;
}

// PATCH /api/programs/admin/reviews/{id}/ — staff/admin only. The doc sample only shows toggling
// is_approved, so that's the only field modelled as writable here.
export interface PatchAdminProgramTestimonialRequest {
  is_approved?: boolean;
}

// GET /api/programs/public/reviews (no trailing slash — that 404s) — every approved review across
// all programs, for a site-wide "What Our Learners Say" feed. Confirmed real shape by a live
// capture: same paginated envelope, and identical fields to AdminProgramTestimonial (including
// is_approved, always true here since this endpoint only returns approved reviews).
export type PublicProgramReview = AdminProgramTestimonial;
