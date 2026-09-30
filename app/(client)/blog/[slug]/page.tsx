"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useBlogPost } from "@/hooks/queries/blog";
import { useCreateBlogComment } from "@/hooks/mutations/blog";
import { useAuthStore } from "@/lib/store/authStore";
import { BlogPostCard } from "@/components/marketing/blog-post-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { formatShortDate } from "@/lib/format";

function CommentForm({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const [body, setBody] = useState("");
  const [guestName, setGuestName] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const createComment = useCreateBlogComment(slug);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    if (!user && !guestName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the verification check.");
      return;
    }
    createComment.mutate(
      {
        body: body.trim(),
        guest_name: user ? undefined : guestName.trim(),
        cf_turnstile_response: captchaToken ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Thanks — your comment will show once it's approved.");
          setBody("");
          setGuestName("");
          setCaptchaToken(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setCaptchaToken(null);
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
      {!user && (
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your name"
          required
          className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        required
        placeholder={user ? "Share your thoughts…" : "Share your thoughts… (posting as a guest)"}
        className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
      />
      <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
      <Button type="submit" loading={createComment.isPending} className="w-auto self-start px-6">
        Post Comment
      </Button>
    </form>
  );
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: post, isLoading, isError } = useBlogPost(slug);

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-gray-400">Loading article…</div>;
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Article not found</h1>
        <p className="mt-3 text-sm text-gray-500">
          This article may have been unpublished or moved. Browse our latest articles instead.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex rounded-full bg-main px-6 py-3 text-sm font-medium text-white hover:bg-deep-blue"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-linear-to-br from-main to-deep-blue px-6 py-16 text-white">
        <Reveal className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-glass">
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>{" "}
            /{" "}
            <Link href={`/blog/category/${post.category_slug}`} className="hover:underline">
              {post.category_name}
            </Link>
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>{post.author_name}</span>
            <span>·</span>
            <span>{formatShortDate(post.published_at)}</span>
            <span>·</span>
            <span>{post.reading_time_minutes} min read</span>
          </div>
        </Reveal>
      </section>

      {post.cover_image_url && (
        <div className="mx-auto -mt-8 max-w-3xl px-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- an arbitrary hosted URL, not worth configuring next/image's domains for */}
          <img
            src={post.cover_image_url}
            alt=""
            className="aspect-[16/9] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      )}

      <article className="mx-auto max-w-3xl px-6 py-12">
        <div
          className="text-gray-700
            [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900
            [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900
            [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900
            [&_p]:mt-4 [&_p]:leading-relaxed
            [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6
            [&_li]:mt-1
            [&_a]:text-secondary [&_a]:underline
            [&_strong]:font-semibold [&_strong]:text-gray-900
            [&_blockquote]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-secondary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500
            [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </article>

      <section className="mx-auto max-w-3xl px-6 pb-14">
        <Reveal className="rounded-2xl bg-linear-to-br from-main to-deep-blue p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Enjoyed this article?</h2>
          <p className="mt-1 text-sm text-white/70">
            Get new CareerCentra articles like this one delivered to your inbox.
          </p>
          <NewsletterForm theme="dark" className="mt-4 max-w-md" />
        </Reveal>
      </section>

      {post.related_posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-14">
          <h2 className="text-lg font-semibold text-gray-900">Related Articles</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {post.related_posts.map((related) => (
              <BlogPostCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Comments {post.comments.length > 0 && `(${post.comments.length})`}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {post.comments.length === 0 && (
              <p className="text-sm text-gray-400">Be the first to share your thoughts.</p>
            )}
            {post.comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{comment.author_name}</span>
                  {comment.is_guest && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Guest</span>
                  )}
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatShortDate(comment.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{comment.body}</p>
              </div>
            ))}
          </div>
          <CommentForm slug={slug} />
        </div>
      </section>
    </div>
  );
}
