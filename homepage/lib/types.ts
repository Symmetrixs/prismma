export type NewsCategory = "malaysia" | "global";
export type MediaType = "image" | "video";

export interface NewsMediaItem {
  id: number;
  media_type: MediaType;
  url: string;
  order: number;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: NewsCategory;
  published: boolean;
  created_at: string;
  updated_at: string;
  media: NewsMediaItem[];
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  freight_type?: string;
  origin?: string;
  destination?: string;
  cargo_details?: string;
  position?: string;
}
