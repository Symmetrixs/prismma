import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import CareersForm from "@/components/CareersForm";
import { Users, TrendingUp, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Prismma Express team. We're always looking for reliable, hardworking people across our logistics operations.",
};

export default function CareersPage() {
  return (
    <>
      <PageBanner
        eyebrow="Join Our Team"
        title="Careers"
        description="We're always looking for reliable, hardworking people to grow with us."
        image="/assets/images/warehouse-services.jpg"
      />

      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">A close-knit team</p>
                  <p className="text-body mt-1">Prismma is a Malaysian company where you're a name, not a number.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Room to grow</p>
                  <p className="text-body mt-1">From driver to dispatcher to operations, we promote from within.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Heart size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Work that matters</p>
                  <p className="text-body mt-1">Every shipment you move keeps a business or a family moving too.</p>
                </div>
              </div>

              <p className="text-sm text-body">
                Don't see your role listed? We're always open to hearing from good people. Send your details below or
                email us directly at enquiry@prismma.net.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-black/5">
              <h2 className="font-display text-2xl font-medium text-brand-navy mb-6">Apply Now</h2>
              <CareersForm />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
