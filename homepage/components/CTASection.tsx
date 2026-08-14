import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden bg-brand-navy">
      <img
        src="/assets/logos/prismma-logo-footer.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/55 via-brand-orange/30 to-brand-navy/45" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <ScrollReveal>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-white leading-tight drop-shadow-lg">
            Let&apos;s Get Moving
          </h2>
          <p className="mt-5 text-lg text-white/95 drop-shadow">
            Get in touch with us today to learn more about our services and how we can help your business grow.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-8 rounded-md bg-brand-navy px-8 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity shadow-lg"
          >
            Contact Us
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
