import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/api";
import ScrollReveal from "@/components/ScrollReveal";
import CTASection from "@/components/CTASection";
import NewsMedia from "@/components/NewsMedia";

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <article className="pt-44 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand-orange">
              {article.category}
            </span>
            <h1 className="mt-3 font-display text-4xl md:text-6xl font-medium text-brand-navy leading-tight">
              {article.title}
            </h1>
          </ScrollReveal>

          {article.media.length > 0 && (
            <ScrollReveal delay={0.1}>
              <NewsMedia media={article.media} className="w-full h-[420px] rounded-xl mt-10" />
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.2}>
            <div className="mt-10 text-body leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </ScrollReveal>
        </div>
      </article>

      <CTASection />
    </>
  );
}
