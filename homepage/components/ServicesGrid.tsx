import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const services = [
  { id: "air-freight", title: "Air Freight", image: "/assets/images/air-freight.jpg" },
  { id: "sea-freight", title: "Sea Freight", image: "/assets/images/sea-freight-services.jpg" },
  { id: "land-transport", title: "Land Transport", image: "/assets/images/slider-road-bg.jpg" },
  { id: "warehouse-distribution", title: "Warehouse & Distribution", image: "/assets/images/warehouse-services.jpg" },
  { id: "customs-brokerage", title: "Customs Brokerage", image: "/assets/images/customs-brokerage-services.jpg" },
  { id: "hand-carry-shipment", title: "Hand Carry Shipment", image: "/assets/images/hand-carry-services.jpg" },
];

export default function ServicesGrid() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-orange">What We Do</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-brand-navy leading-tight">
              Our Services
            </h2>
            <p className="mt-6 text-lg text-body">
              Advanced technology and systems allow for efficient management of logistics and
              deliveries, backed by a wide network of delivery locations and partnerships with
              top carriers and airlines.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ScrollReveal key={service.id} delay={i * 0.08}>
              <Link
                href={`/services#${service.id}`}
                className="group relative block h-80 rounded-xl overflow-hidden"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" />
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white px-5 py-4 shadow-lg transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="font-display text-xl font-medium text-brand-navy">{service.title}</h3>
                  <span className="block mt-2 w-10 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-16" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
