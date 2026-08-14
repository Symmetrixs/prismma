import ScrollReveal from "./ScrollReveal";

interface PageBannerProps {
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
}

export default function PageBanner({ eyebrow, title, description, image }: PageBannerProps) {
  return (
    <section className="relative h-[380px] md:h-[440px] flex items-end overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/60 to-brand-navy/20" />

      <div className="relative w-full px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <span className="font-display italic text-lg text-brand-orange">{eyebrow}</span>
            <h1 className="mt-2 font-display text-4xl md:text-6xl font-medium text-white leading-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-lg text-white/85 max-w-2xl">{description}</p>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
