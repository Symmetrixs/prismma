import AnimatedCounter from "./AnimatedCounter";
import ScrollReveal from "./ScrollReveal";

const stats = [
  { value: 35, label: "Land Vehicles" },
  { value: 60, label: "Active Workers" },
  { value: 20, label: "Years of Experience" },
  { value: 5066068, label: "Deliveries", continuous: true },
  { value: 400, label: "Warehouse Capacity (sqft)" },
];

export default function StatsSection() {
  return (
    <section className="relative -mt-16 px-4 md:px-6 z-10">
      <ScrollReveal>
        <div className="mx-auto max-w-6xl rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 px-3 md:px-6 py-10 flex flex-wrap md:flex-nowrap items-start justify-center md:justify-between gap-x-6 gap-y-8 md:gap-2 lg:gap-4">
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} value={stat.value} label={stat.label} continuous={stat.continuous} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
