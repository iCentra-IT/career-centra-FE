import type { MetadataRoute } from "next";
import { getPrograms } from "@/lib/api/programs";
import { getCareerPaths } from "@/lib/api/career-paths";
import { getBlogPosts, getBlogCategories } from "@/lib/api/blog";

const SITE_URL = "https://careercentra.icentra.com";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/programms", priority: 0.9, changeFrequency: "daily" },
  { path: "/career-paths", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/why-careercentra", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partnerships", priority: 0.6, changeFrequency: "monthly" },
  { path: "/facilitator", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

// Best-effort — a broken/slow backend shouldn't take the whole sitemap down, just shrink it to
// the static routes for that one section. page_size overrides the backend's default of 20 (see
// the same pattern already used for admin program pickers) so this actually gets everything
// instead of just the first page.
async function safeUrls<T>(fetcher: () => Promise<T[]>, toEntry: (item: T) => MetadataRoute.Sitemap[number]): Promise<MetadataRoute.Sitemap> {
  try {
    const items = await fetcher();
    return items.map(toEntry);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [programEntries, careerPathEntries, blogPostEntries, blogCategoryEntries] = await Promise.all([
    safeUrls(
      async () => (await getPrograms({ page_size: 200 })).results,
      (program) => ({
        url: `${SITE_URL}/programms/${program.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    safeUrls(
      async () => (await getCareerPaths({ page: 1 })).results,
      (path) => ({
        url: `${SITE_URL}/career-paths/${path.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    safeUrls(
      // Only the first page — /api/blog/posts/ has no confirmed page_size override the way
      // /api/programs/ does, so once there are more posts than one page holds this should be
      // extended to walk total_pages instead.
      async () => (await getBlogPosts({ page: 1 })).results,
      (post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    safeUrls(
      async () => (await getBlogCategories()).results,
      (category) => ({
        url: `${SITE_URL}/blog/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      }),
    ),
  ]);

  return [...staticEntries, ...programEntries, ...careerPathEntries, ...blogPostEntries, ...blogCategoryEntries];
}
