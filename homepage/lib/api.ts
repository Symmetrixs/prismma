import { NewsArticle, NewsCategory, ContactFormPayload } from "./types";

const SERVER_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getNews(category?: NewsCategory): Promise<NewsArticle[]> {
  try {
    const url = new URL(`${SERVER_API_URL}/news`);
    if (category) url.searchParams.set("category", category);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}/news/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function submitContactForm(payload: ContactFormPayload): Promise<boolean> {
  try {
    const res = await fetch(`${CLIENT_API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
