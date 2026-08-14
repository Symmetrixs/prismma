import ScrollReveal from "./ScrollReveal";

const clientLogos = [
  { name: "Sony", file: "sony-logo.png" },
  { name: "Premium Sound Solutions", file: "premium-sound-logo.png" },
  { name: "Frontken", file: "frontken-rescaled-logo.png" },
  { name: "Phili Orient Group", file: "phili-orient-group-logo.png" },
  { name: "Schenker", file: "schenker-logo.png" },
  { name: "Paramit", file: "paramit-logo.png" },
  { name: "Clin", file: "clin-logo.png" },
  { name: "DSV", file: "dsv-logo.png" },
  { name: "KWE", file: "kwe-logo.png" },
  { name: "Sanmina SCI", file: "sanmina-sci-logo.png" },
  { name: "Fuji Logistics", file: "fuji-logistics-logo.png" },
  { name: "CEVA", file: "ceva-logo.png" },
  { name: "Apex Dynamic Solutions", file: "apex-dynamic-solutions-logo.png" },
];

const loopedLogos = [...clientLogos, ...clientLogos];

export default function PartnersLogos() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-brand-orange/[0.16] via-white to-brand-navy/[0.16]">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <h2 className="text-center font-display text-3xl font-medium text-brand-navy mb-16">
            Trusted By Industry Leaders
          </h2>
        </ScrollReveal>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex w-max animate-marquee">
          {loopedLogos.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className="relative h-24 w-64 mx-8 shrink-0 flex items-center justify-center">
              <img
                src={`/assets/logos/other-brands/${logo.file}`}
                alt={logo.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
