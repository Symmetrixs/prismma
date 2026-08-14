import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

const testimonials = [
  {
    quote:
      "Prismma Express has been a game changer for our business. Their air freight service has allowed us to expand our reach and deliver our products to customers across the globe.",
    name: "Daryl Sim",
    company: "Enco Instruments",
  },
  {
    quote:
      "I've been using Prismma Express's road freight service for years, and their team has always been professional, courteous, and reliable.",
    name: "Lina Doe",
    company: "Something Today",
  },
  {
    quote:
      "Cannot thank Prismma Express enough for their customs brokerage service. They made sure all the paperwork was in order, and my shipment was cleared without any issues.",
    name: "Matthew Caw",
    company: "RedBox Equipments",
  },
  {
    quote:
      "The warehouse solutions provided by Prismma Express are excellent. Their facilities are clean, secure, and well maintained.",
    name: "Tasha Reeves",
    company: "Gems Agency",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-orange">Testimonials</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-brand-navy leading-tight">
              Loved by Everyone
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.08}>
              <div className="h-full rounded-xl bg-white p-8 shadow-sm border border-black/5">
                <span className="font-display text-5xl text-brand-orange/30 leading-none">&ldquo;</span>
                <p className="text-body leading-relaxed -mt-4">{t.quote}</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src="/assets/images/placeholder-avatar.png"
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-brand-navy">{t.name}</p>
                    <p className="text-sm text-body">{t.company}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
