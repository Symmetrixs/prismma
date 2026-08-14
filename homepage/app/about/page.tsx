import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";
import { Rocket, Truck, Handshake, Building2, Warehouse, TrendingUp, Globe } from "lucide-react";

const milestones = [
  { year: "2005", icon: Rocket, text: "Prismma Express founded as an Enterprise company with a modest fleet." },
  { year: "2008", icon: Truck, text: "Expanded our fleets to bolster local distribution capabilities." },
  { year: "2012", icon: Handshake, text: "Secured a franchise with a courier service company, facilitating district level deliveries." },
  { year: "2018", icon: Building2, text: "Progressed to support MNC companies with Milk Run distribution and JIT services." },
  { year: "2020", icon: Warehouse, text: "Diversified into warehousing and distribution services to cater to MNC players." },
  { year: "2022", icon: TrendingUp, text: "Strengthened and broadened our warehouse services to serve a wider range of needs." },
  { year: "2023", icon: Globe, text: "Expanding our cross border land transport service to include routes from Singapore to Thailand." },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="About Us"
        title="Prismma"
        image="/assets/images/slider-sea-bg.jpg"
      />

      <section className="pt-20 pb-24 px-6">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <p className="text-lg text-body leading-relaxed">
              Established in 2011, Prismma Express is a Malaysian based logistics service provider
              that offers a comprehensive range of logistics solutions. We facilitate the movement
              of parts and materials from suppliers to manufacturers, as well as the distribution
              of finished products from manufacturers to distributors and retailers. Our services
              encompass sea, air, and land transportation, warehousing, and freight forwarding.
            </p>
            <p className="mt-4 text-lg text-body leading-relaxed">
              As a local logistics company, we have evolved beyond the traditional role of freight
              forwarding to become a provider of integrated logistics and distribution services.
              Our combination of experienced personnel, competitive pricing, robust operational
              infrastructure, strategic geographic location, and financial stability empowers us
              to deliver the resources necessary for our customers to attain and sustain leadership
              positions within their respective industries.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-brand-orange/[0.16] via-white to-brand-navy/[0.16]">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div>
              <h2 className="font-display text-3xl font-medium text-brand-navy">Mission</h2>
              <p className="mt-4 text-body leading-relaxed">
                Our mission is to provide comprehensive support in the areas of import and export,
                enabling you to save both valuable time and financial resources.
              </p>
            </div>
            <div className="mt-12">
              <h2 className="font-display text-3xl font-medium text-brand-navy">Vision</h2>
              <p className="mt-4 text-body leading-relaxed">
                &ldquo;What is the status of my shipment?&rdquo; is the question constantly asked by
                importers and exporters. For that reason, we have trained our team to track and
                clear your shipments as quickly as possible while in transit.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="relative h-[420px]">
              <img
                src="/assets/images/air-freight.jpg"
                alt="Prismma Express air freight operations"
                className="absolute top-0 right-0 w-4/5 h-4/5 object-cover rounded-xl shadow-xl"
              />
              <img
                src="/assets/images/customs-brokerage-services.jpg"
                alt="Prismma Express customs documentation"
                className="absolute bottom-0 left-0 w-3/5 h-3/5 object-cover rounded-xl shadow-xl border-4 border-white"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-orange">Our Journey</span>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-brand-navy">
                Prismma Milestones
              </h2>
            </div>
          </ScrollReveal>

          <div>
            {milestones.map((m, i) => {
              const Icon = m.icon;
              const isLast = i === milestones.length - 1;
              return (
                <ScrollReveal key={m.year} delay={i * 0.08}>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center shrink-0 w-14">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-orange text-white shadow-lg shrink-0">
                        <Icon size={22} />
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-brand-orange mt-2" />}
                    </div>
                    <div className="pt-2 pb-10">
                      <span className="font-display text-2xl font-semibold text-brand-navy">{m.year}</span>
                      <p className="mt-2 text-body leading-relaxed max-w-lg">{m.text}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
