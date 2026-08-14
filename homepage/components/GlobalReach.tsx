import ScrollReveal from "./ScrollReveal";
import AnimatedBackground from "./AnimatedBackground";
import { Plane, Ship, Truck } from "lucide-react";

const routes = [
  {
    icon: Truck,
    title: "Regional Land Network",
    description: "Dedicated fleet coverage across Malaysia, with cross border trucking extending from Singapore to China.",
  },
  {
    icon: Ship,
    title: "Global Ocean Freight",
    description: "FCL and LCL shipments moving through partner shipping lines to seaports worldwide.",
  },
  {
    icon: Plane,
    title: "International Air Cargo",
    description: "Affiliated carrier network with strategic offices at destinations across the globe.",
  },
];

export default function GlobalReach() {
  return (
    <section className="relative py-28 px-6 bg-brand-navy overflow-hidden">
      <AnimatedBackground variant="dark" intensity="moderate" />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-orange">Global Reach</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-white leading-tight">
              One network, every mode of transport
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              From a single warehouse in Pulau Pinang to a coordinated network spanning air, sea,
              and land, Prismma Express connects your cargo to wherever it needs to go next.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {routes.map((route, i) => {
            const Icon = route.icon;
            return (
              <ScrollReveal key={route.title} delay={i * 0.1}>
                <div className="bg-white/[0.06] backdrop-blur-sm border border-white/15 rounded-xl p-8 h-full hover:bg-white/[0.1] transition-colors">
                  <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-white/10 text-brand-orange">
                    <Icon size={28} />
                  </div>
                  <h3 className="mt-6 font-display text-xl text-white">{route.title}</h3>
                  <p className="mt-3 text-white/60 leading-relaxed">{route.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
