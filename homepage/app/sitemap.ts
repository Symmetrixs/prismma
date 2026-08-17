import type { MetadataRoute } from "next";
import { getNews } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://prismma.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/our-partners`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/latest-news`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/get-a-quote`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/track-shipment`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/careers`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const articles = await getNews();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/latest-news/${article.slug}`,
    lastModified: article.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}
