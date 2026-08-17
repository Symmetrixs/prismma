import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import { Search, Construction, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Your Shipment",
  description: "Shipment tracking for Prismma Express customers, coming soon.",
};

export default function TrackShipmentPage() {
  return (
    <>
      <PageBanner
        eyebrow="Coming Soon"
        title="Track Your Shipment"
        description="Real-time shipment tracking is on its way. In the meantime, our team is one call away."
        image="/assets/images/hand-carry-services.jpg"
      />

      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <div className="bg-white rounded-xl border border-black/10 p-10 shadow-sm">
              <div className="mx-auto mb-6 flex items-center justify-center w-14 h-14 rounded-full bg-brand-orange/10 text-brand-orange">
                <Construction size={26} />
              </div>

              <div className="relative mb-6 opacity-50 pointer-events-none">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                <input
                  disabled
                  placeholder="Enter your tracking number"
                  className="w-full rounded-md border border-black/10 pl-11 pr-4 py-3.5 text-base bg-gray-50"
                />
              </div>

              <h2 className="font-display text-2xl font-medium text-brand-navy mb-2">
                We're building shipment tracking
              </h2>
              <p className="text-body mb-8">
                Soon you'll be able to check your shipment's status right here. It's currently in development, we'll
                announce it on our Latest News page the moment it's live.
              </p>

              <a
                href="tel:+60106606600"
                className="inline-flex items-center gap-2 rounded-md bg-brand-navy px-8 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity"
              >
                <Phone size={18} />
                Call us for a status update
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
