import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { Zap, ShieldCheck } from "lucide-react";

export default function CompanyIntro() {
  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <ScrollReveal>
          <img
            src="/assets/images/prismma-our-solution-asset.png"
            alt="Prismma Express employee moving goods"
            className="w-full rounded-xl"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-orange">Who We Are</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-brand-navy leading-tight">
            Your Seamless Moving Experience
          </h2>
          <p className="mt-6 text-lg text-body leading-relaxed">
            At Prismma Express, we specialize in providing reliable and cost-effective logistics
            and courier solutions to businesses and individuals. With years of experience and a
            dedicated team of professionals, we are committed to ensuring that your shipments are
            delivered on time and in perfect condition.
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 rounded-md bg-brand-navy px-7 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity"
          >
            About Us
          </Link>

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                <Zap size={28} />
              </div>
              <p className="font-medium text-brand-navy">Fast &amp; Reliable</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                <ShieldCheck size={28} />
              </div>
              <p className="font-medium text-brand-navy">Quality Service</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
