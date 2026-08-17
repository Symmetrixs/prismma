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
        <div className="mx-auto max-w-6xl rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 px-4 md:px-6 py-8 md:py-10 flex flex-nowrap items-start justify-start md:justify-between overflow-x-auto gap-x-5 md:gap-x-8 lg:gap-x-10">
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} value={stat.value} label={stat.label} continuous={stat.continuous} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
