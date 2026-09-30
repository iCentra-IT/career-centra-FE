import type { Metadata } from "next";
import { cache } from "react";
import { getBlogPost } from "@/lib/api/blog";
import { BlogPostContent } from "@/components/marketing/blog-post-content";

const SITE_URL = "https://careercentra.icentra.com";

// Dedupes the fetch within a single request — generateMetadata and the page component both need
// the same post, and unlike Next's built-in fetch(), axios calls aren't auto-deduped.
const getPostCached = cache((slug: string) => getBlogPost(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostCached(slug);
    const description = post.meta_description || post.excerpt;
    return {
      title: post.meta_title || post.title,
      description,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description,
        type: "article",
        publishedTime: post.published_at,
        authors: [post.author_name],
        ...(post.cover_image_url && { images: [{ url: post.cover_image_url }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
      },
    };
  } catch {
    // Unpublished/deleted/bad slug — BlogPostContent shows its own "not found" state.
    return { title: "Article" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostCached(slug).catch(() => null);

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: post.cover_image_url || undefined,
              datePublished: post.published_at,
              author: { "@type": "Person", name: post.author_name },
              publisher: {
                "@type": "Organization",
                name: "CareerCentra",
                logo: { "@type": "ImageObject", url: `${SITE_URL}/CareerCentra-full-logo.png` },
              },
              mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
            }),
          }}
        />
      )}
      <BlogPostContent slug={slug} />
    </>
  );
}
