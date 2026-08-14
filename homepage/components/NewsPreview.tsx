import Link from "next/link";
import { getNews } from "@/lib/api";
import ScrollReveal from "./ScrollReveal";
import NewsMedia from "./NewsMedia";

export default async function NewsPreview() {
  const articles = await getNews();
  const preview = articles.slice(0, 2);

  return (
    <section className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand-orange">Stay Updated</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-brand-navy leading-tight">
              Latest News
            </h2>
            <p className="mt-6 text-body">
              See what industry experts are saying about Prismma Express and our innovative logistics solutions.
            </p>
          </div>
        </ScrollReveal>

        {preview.length === 0 ? (
          <p className="text-sm text-body">No news articles published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preview.map((article, i) => (
              <ScrollReveal key={article.id} delay={i * 0.1}>
                <Link
                  href={`/latest-news/${article.slug}`}
                  className="block rounded-xl overflow-hidden border border-black/5 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    <NewsMedia media={article.media} className="w-full h-full" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs uppercase tracking-wide text-brand-orange font-medium">
                      {article.category}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-medium text-brand-navy">{article.title}</h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link href="/latest-news" className="text-sm font-medium text-brand-orange hover:underline">
            View All News
          </Link>
        </div>
      </div>
    </section>
  );
}
