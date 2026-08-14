import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import CTASection from "@/components/CTASection";

interface Partner {
  name: string;
  file?: string;
}

const partnerGroups: { title: string; items: Partner[] }[] = [
  {
    title: "Air Carriers",
    items: [
      { name: "Malaysia Airlines", file: "malaysia-airlines-logo.png" },
      { name: "Singapore Airlines", file: "singapore-airlines-logo.png" },
      { name: "Cathay Pacific", file: "cathay-pacific-logo.png" },
      { name: "Etihad", file: "etihad-logo.png" },
      { name: "China Airlines", file: "china-airline-solutions-logo.png" },
      { name: "Emirates", file: "emirates-new.png" },
    ],
  },
  {
    title: "Shipping Corporations",
    items: [
      { name: "Evergreen", file: "evergreen-new.png" },
      { name: "Ocean Network Express", file: "one-logo.png" },
      { name: "TS Line", file: "ts-line-new.png" },
      { name: "MSC", file: "msc-new.png" },
      { name: "Ocean Master", file: "oceanmaster-logo.png" },
    ],
  },
  {
    title: "International Network Partners",
    items: [
      { name: "WCA", file: "wca-new.png" },
      { name: "Uniforce", file: "uniforce-new.png" },
      { name: "Lognet Global", file: "lognet-new.png" },
    ],
  },
  {
    title: "Affiliations",
    items: [
      { name: "PFFA", file: "pffa-new-logo.png" },
      { name: "IATA", file: "iata-new.png" },
      { name: "AFAM", file: "afam.png" },
      { name: "TAPA", file: "tapa-new.png" },
    ],
  },
  {
    title: "Our Clients",
    items: [
      { name: "Paramit", file: "paramit-logo.png" },
      { name: "TECAN", file: "tecan-new.png" },
      { name: "Frontken", file: "frontken-rescaled-logo.png" },
      { name: "Premium Sound Solutions", file: "premium-sound-logo.png" },
      { name: "Sony", file: "sony-logo.png" },
      { name: "QPlus", file: "qplus-new.png" },
      { name: "MATTEL", file: "mattel-new.png" },
      { name: "Clin", file: "clin-logo.png" },
      { name: "Apex", file: "apex-dynamic-solutions-logo.png" },
    ],
  },
];

export default function OurPartnersPage() {
  return (
    <>
      <PageBanner
        eyebrow="Learn More About"
        title="Our Partners"
        image="/assets/images/slider-air-bg-1.jpg"
      />

      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          {partnerGroups.map((group, i) => (
            <ScrollReveal key={group.title} delay={i * 0.06}>
              <div>
                <h2 className="font-display text-2xl font-medium text-brand-navy mb-6">{group.title}</h2>
                <div className="flex flex-wrap gap-5 items-center">
                  {group.items.map((item) =>
                    item.file ? (
                      <div
                        key={item.name}
                        className="flex items-center justify-center h-28 w-64 rounded-lg border border-black/10 bg-white px-6 py-5 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={`/assets/logos/other-brands/${item.file}`}
                          alt={item.name}
                          className="max-h-14 max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <span
                        key={item.name}
                        className="flex items-center h-28 rounded-lg border border-dashed border-black/15 bg-gray-50 px-6 text-body"
                      >
                        {item.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
