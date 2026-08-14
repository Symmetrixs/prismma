import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";
import { Plane, Ship, Truck, Warehouse, ClipboardCheck, PackageOpen, ArrowUpRight } from "lucide-react";

const phases = [
  "Analysing the current supply chain",
  "Determining future operational needs",
  "Identifying the optimal network and operations model",
  "Creating a structured transition plan",
  "Conducting due diligence on potential acquisitions",
];

const services = [
  {
    id: "air-freight",
    icon: Plane,
    title: "Air Freight",
    image: "/assets/images/air-freight.jpg",
    description:
      "We work with international affiliated carriers and maintain strategic offices at every destination, both local and international, so freight moves quickly regardless of distance. Our air freight network is built for time sensitive cargo that needs to move beyond the horizon of standard delivery windows, without compromising on compliance.",
  },
  {
    id: "sea-freight",
    icon: Ship,
    title: "Sea Freight",
    image: "/assets/images/sea-freight-services.jpg",
    description:
      "Leveraging an extensive network of ocean shipping lines, we offer global sea freight services for both Full Container Load and Less than Container Load shipments. Deliveries are coordinated to domestic and international seaports with consistent, predictable timelines, suited to businesses moving high volume cargo where cost efficiency matters most.",
  },
  {
    id: "land-transport",
    icon: Truck,
    title: "Land Transport",
    image: "/assets/images/slider-road-bg.jpg",
    description:
      "Our dedicated fleet of trucks serves customers across Malaysia, covering routes from the north to the south of the peninsula. This extends to cross border trucking as well, running from Singapore through to China, giving businesses a single reliable partner for regional overland movement.",
  },
  {
    id: "warehouse-distribution",
    icon: Warehouse,
    title: "Warehouse & Distribution",
    image: "/assets/images/warehouse-services.jpg",
    description:
      "With warehouse capacity supporting multinational distribution needs, our storage and distribution services scale from short term staging to full inventory management. This capability has grown steadily over the years to serve a wider range of client needs, from Milk Run distribution to Just In Time delivery models.",
  },
  {
    id: "customs-brokerage",
    icon: ClipboardCheck,
    title: "Customs Brokerage",
    image: "/assets/images/customs-brokerage-services.jpg",
    description:
      "Clearing customs is often the most unpredictable part of any shipment. Our team provides personalized guidance through every stage of the process, ensuring documentation is correct and complete so shipments clear without unnecessary delay.",
  },
  {
    id: "hand-carry-shipment",
    icon: PackageOpen,
    title: "Hand Carry Shipment",
    image: "/assets/images/hand-carry-services.jpg",
    description:
      "For urgent, time critical cargo, our hand carry service provides a dedicated courier who personally accompanies the shipment from origin to destination, the fastest option available when timing cannot be compromised.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageBanner
        eyebrow="Services"
        title="Digital and Supply Chain Transformation"
        description="Prismma Express integrates digital and supply chain transformation in five phases, helping businesses move from reactive logistics to a fully optimized network."
        image="/assets/images/services-banner-bg.jpg"
      />

      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-14">
          <ScrollReveal>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-brand-navy leading-tight">
              A structured path from reactive logistics to a fully optimized network
            </h2>
            <p className="mt-4 text-body leading-relaxed">
              Every engagement starts with understanding where your supply chain stands today,
              then builds toward where it needs to be.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <ol className="space-y-4">
              {phases.map((phase, i) => (
                <li key={phase} className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-body pt-1">{phase}</span>
                </li>
              ))}
            </ol>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <ScrollReveal key={service.id} delay={i * 0.06}>
                  <a
                    href={`#${service.id}`}
                    className="group relative block h-56 rounded-xl overflow-hidden"
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                      <div>
                        <Icon size={18} className="text-white/70 mb-1" />
                        <p className="text-white text-sm font-medium">{service.title}</p>
                      </div>
                      <ArrowUpRight size={18} className="text-white/70 group-hover:text-white transition-colors" />
                    </div>
                  </a>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-brand-orange/[0.16] via-white to-brand-navy/[0.16]">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="relative">
              <img
                src="/assets/images/customs-brokerage-services.jpg"
                alt="Prismma Express quality of service"
                className="w-full aspect-[4/5] object-cover rounded-xl shadow-lg"
              />
              <div className="absolute bottom-3 right-3 md:-bottom-5 md:-right-5 bg-brand-orange text-white text-sm font-medium px-5 py-3 md:px-6 md:py-4 rounded-lg shadow-lg max-w-[180px] md:max-w-[200px]">
                Dedicated to quality, every shipment
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <span className="font-display italic text-lg text-brand-orange">Features</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-medium text-brand-navy leading-tight">
              Quality of Services
            </h2>
            <p className="mt-6 text-body leading-relaxed">
              Every shipment is handled by a team that understands the difference speed and
              accuracy make to your business. From the moment cargo is booked to the moment it
              clears customs, our operations team tracks it, documents it, and keeps you informed,
              because knowing where your shipment stands should never be a guessing game.
            </p>
            <p className="mt-4 text-body leading-relaxed">
              This same standard extends across every mode we operate, air, sea, land, and
              warehousing, backed by a network of certified partners and carriers built over
              more than a decade in the industry.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="mx-auto max-w-5xl space-y-20">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <ScrollReveal key={service.id} delay={i * 0.05}>
                <div id={service.id} className="scroll-mt-28 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                  <div className="md:col-span-2">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-56 object-cover rounded-xl"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-orange/10 text-brand-orange mb-4">
                      <Icon size={24} />
                    </div>
                    <h2 className="font-display text-2xl font-medium text-brand-navy mb-3">{service.title}</h2>
                    <p className="text-body leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <CTASection />
    </>
  );
}
