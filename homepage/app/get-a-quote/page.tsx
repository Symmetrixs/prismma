import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import QuoteForm from "@/components/QuoteForm";
import { Clock, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Request a freight quote from Prismma Express for air, sea, or land transport, tailored to your shipment.",
};

export default function GetAQuotePage() {
  return (
    <>
      <PageBanner
        eyebrow="Request a Quote"
        title="Get a Quote"
        description="Tell us about your shipment and our team will get back to you with a tailored quote."
        image="/assets/images/air-freight.jpg"
      />

      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Fast turnaround</p>
                  <p className="text-body mt-1">We aim to respond to every quote request within one business day.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Truck size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Every mode covered</p>
                  <p className="text-body mt-1">Air, sea, and land transport, plus warehousing and distribution.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">No obligation</p>
                  <p className="text-body mt-1">A quote is just a quote, you're free to compare and decide.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-black/5">
              <h2 className="font-display text-2xl font-medium text-brand-navy mb-6">Shipment Details</h2>
              <QuoteForm />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
