import ScrollReveal from "@/components/ScrollReveal";
import PageBanner from "@/components/PageBanner";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ADDRESS = "NO. 736, Lorong Perindustrian Bukit Minyak 11, Kawasan Bukit Minyak, 14100 Simpang Ampat, Pulau Pinang, MALAYSIA";

export default function ContactPage() {
  return (
    <>
      <PageBanner
        eyebrow="Get In Touch"
        title="Contact Us"
        description="Have a shipment to move or a question about our services? Our team is ready to help."
        image="/assets/images/slider-road-bg.jpg"
      />

      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Address</p>
                  <p className="text-body mt-1">{ADDRESS}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Phone</p>
                  <p className="text-body mt-1">+6 010 660 6600</p>
                  <p className="text-body">+6 016 850 4340</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Email</p>
                  <p className="text-body mt-1">enquiry@prismma.net</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="font-medium text-brand-navy">Operating Hours</p>
                  <p className="text-body mt-1">Monday to Friday, 9:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-black/5">
              <h2 className="font-display text-2xl font-medium text-brand-navy mb-6">Send a Message</h2>
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="rounded-xl overflow-hidden border border-black/10 shadow-sm">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Prismma Express location"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
