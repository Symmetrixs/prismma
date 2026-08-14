import Link from "next/link";
import { getNews } from "@/lib/api";
import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";
import { NewsCategory } from "@/lib/types";
import { Newspaper } from "lucide-react";
import NewsMedia from "@/components/NewsMedia";

const categories: { key: NewsCategory; label: string }[] = [
  { key: "malaysia", label: "Malaysia" },
  { key: "global", label: "Global" },
];

export default async function LatestNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = (params.category as NewsCategory) || "malaysia";
  const articles = await getNews(activeCategory);

  return (
    <>
      <PageBanner
        eyebrow="Stay Updated"
        title="Latest News"
        description="See what industry experts are saying about Prismma Express and our innovative logistics solutions."
        image="/assets/images/video-banner-bg.jpg"
      />

      <section className="pt-16 pb-4 px-6 text-center">
        <div className="flex justify-center gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/latest-news?category=${cat.key}`}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-brand-orange text-white"
                  : "bg-gray-100 text-body hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-28 px-6 min-h-[320px]">
        <div className="mx-auto max-w-5xl">
          {articles.length === 0 ? (
            <ScrollReveal>
              <div className="flex flex-col items-center text-center py-20">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange mb-5">
                  <Newspaper size={28} />
                </div>
                <h3 className="font-display text-xl font-medium text-brand-navy">Nothing published here yet</h3>
                <p className="mt-2 text-body max-w-sm">
                  Check back soon, our team publishes updates on shipping routes, industry news, and company milestones.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article, i) => (
                <ScrollReveal key={article.id} delay={i * 0.08}>
                  <Link
                    href={`/latest-news/${article.slug}`}
                    className="block rounded-xl overflow-hidden border border-black/5 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <NewsMedia media={article.media} className="w-full h-full" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-medium text-brand-navy">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-body mt-2">{article.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
